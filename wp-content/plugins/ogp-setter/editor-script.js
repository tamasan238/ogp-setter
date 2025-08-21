const { registerPlugin } = wp.plugins;
const { PluginSidebar } = wp.editPost;
const { PanelBody, Button, Spinner } = wp.components;
const { createElement, useState } = wp.element;
const { select, dispatch } = wp.data;

const CustomSidebar = () => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        const post = select('core/editor').getCurrentPost();
        const postId = post.id;
        const title = post.title;

        try {
            const response = await fetch(
                wpApiSettings.root + 'ogp-setter/v1/generate-ogp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpApiSettings.nonce,
                    },
                    body: JSON.stringify({ title, post_id: postId }),
                }
            );

            const data = await response.json();

            if (data.success) {
                dispatch('core/editor').editPost({
                    meta: {
                        _custom_og_image: data.url
                    }
                });
                alert('OGP image has been set!');
            } else {
                alert('Failed to generate OGP: ' + data.message);
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
        { name: 'custom-sidebar', title: 'OGP Setter', icon: 'lightbulb' },
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

registerPlugin('custom-sidebar', { render: CustomSidebar });
