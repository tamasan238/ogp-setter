const { registerPlugin } = wp.plugins;
const { PluginSidebar } = wp.editor;
const { PanelBody, Button, Spinner } = wp.components;
const { createElement, useState } = wp.element;
const { select, dispatch } = wp.data;

const CustomSidebar = () => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        // Get the title of the currently edited post
        const post = select('core/editor').getCurrentPost();
        const title = post.title;

        try {
            // Send to PHP REST API
            const response = await fetch(
                wpApiSettings.root + 'ogp-setter/v1/generate-ogp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpApiSettings.nonce,
                    },
                    body: JSON.stringify({ title }),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Set as featured image
                dispatch('core/editor').editPost({ featured_media: data.attachment_id });
                alert('OGP image has been set as the featured image!');
            } else {
                alert('Failed to generate OGP (js): ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return createElement(
        PluginSidebar,
        {
            name: 'custom-sidebar',
            title: 'OGP Setter (for JP)',
            icon: 'lightbulb',
        },
        createElement(
            PanelBody,
            { initialOpen: true },
            createElement(
                Button,
                { isPrimary: true, onClick: handleClick, disabled: loading },
                loading ? createElement(Spinner) : 'Generate OGP Image'
            ),
            createElement(
                'p',
                { style: { marginTop: '10px' } },
                '実行完了まで数十秒かかります。',
                createElement('br'),
                'It may take several tens of seconds to complete.',
                createElement('br'),
                createElement('br'),
                'タイトル変更が反映されないときは、',
                createElement('br'),
                '一旦保存して再度実行してください。',
                createElement('br'),
                'If the title change is not reflected,',
                createElement('br'),
                'please save and try again.'
            )
        )
    );
};

registerPlugin('custom-sidebar', {
    render: CustomSidebar,
});
