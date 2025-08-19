const { registerPlugin } = wp.plugins;
const { PluginPostStatusInfo } = wp.editPost;
const { Button } = wp.components;

const CustomButton = () => {
    return (
        <PluginPostStatusInfo>
            <Button
                isPrimary
                onClick={() => alert('カスタムボタンがクリックされました！')}
            >
                カスタムボタン
            </Button>
        </PluginPostStatusInfo>
    );
};

registerPlugin('custom-editor-button', {
    render: CustomButton
});
