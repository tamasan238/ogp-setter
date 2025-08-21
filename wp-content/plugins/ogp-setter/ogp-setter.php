<?php
/**
 * Plugin Name: OGP Setter
 * Description: Automatically generates and sets OGP images from article titles with a click.
 * Version: 1.1
 * Author: Masaki Iwai
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function ceb_enqueue_block_editor_assets() {
    wp_enqueue_script(
        'ceb-editor-script',
        plugins_url( 'editor-script.js', __FILE__ ),
        array(
            'wp-plugins',
            'wp-edit-post',
            'wp-element',
            'wp-components',
            'wp-data',
        ),
        filemtime( plugin_dir_path( __FILE__ ) . 'editor-script.js' )
    );
}
add_action( 'enqueue_block_editor_assets', 'ceb_enqueue_block_editor_assets' );


add_action('rest_api_init', function () {
    register_rest_route('ogp-setter/v1', '/generate-ogp', array(
        'methods' => 'POST',
        'callback' => 'ogp_setter_generate',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
});

function ogp_setter_generate($request) {
    try {
        $title   = sanitize_text_field($request->get_param('title'));
        $post_id = intval($request->get_param('post_id'));

        $upload_dir = wp_upload_dir();
        $file_path  = $upload_dir['path'] . '/ogp-' . time() . '.png';

        $ch = curl_init('http://host.docker.internal:8082/ogp?title=' . urlencode($title));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        file_put_contents($file_path, $result);
        curl_close($ch);

        $attachment = array(
            'post_mime_type' => 'image/png',
            'post_title'     => $title,
            'post_content'   => '',
            'post_status'    => 'inherit'
        );
        $attach_id = wp_insert_attachment($attachment, $file_path);

        if (is_wp_error($attach_id)) {
            throw new Exception("wp_insert_attachment failed: " . $attach_id->get_error_message());
        }

        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
        wp_update_attachment_metadata($attach_id, $attach_data);

        $image_url = wp_get_attachment_url($attach_id);

        update_post_meta($post_id, '_custom_og_image', $image_url);

        return array(
            'success'       => true,
            'attachment_id' => $attach_id,
            'url'           => $image_url,
        );
    } catch (Exception $e) {
        error_log($e->getMessage());
        return new WP_Error('ogp_error', $e->getMessage(), array('status' => 500));
    }
}

add_action('wp_head', function() {
    if (is_singular()) {
        global $post;
        $og_image = get_post_meta($post->ID, '_custom_og_image', true);
        if ($og_image) {
            echo '<meta property="og:title" content="' . esc_attr(get_the_title()) . '" />' . "\n";
            echo '<meta property="og:description" content="' . esc_attr(get_the_excerpt()) . '" />' . "\n";
            echo '<meta property="og:url" content="' . esc_url(get_permalink()) . '" />' . "\n";
            echo '<meta property="og:type" content="article" />' . "\n";
            echo '<meta property="og:image" content="' . esc_url($og_image) . '" />' . "\n";
            echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
            echo '<meta name="twitter:image" content="' . esc_url($og_image) . '" />' . "\n";
        }
    }
});
