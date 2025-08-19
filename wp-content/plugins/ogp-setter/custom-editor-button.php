<?php
/**
 * Plugin Name: Custom Editor Button
 * Description: 投稿編集画面にカスタムボタンを追加するプラグイン
 * Version: 1.0
 * Author: あなたの名前
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // 直接アクセスを防ぐ
}

// Gutenberg用スクリプトの読み込み
function ceb_enqueue_block_editor_assets() {
    wp_enqueue_script(
        'ceb-editor-script',
        plugins_url( 'editor-script.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'editor-script.js' )
    );
}
add_action( 'enqueue_block_editor_assets', 'ceb_enqueue_block_editor_assets' );
