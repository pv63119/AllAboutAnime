
export function getPostExcerpt(content: string, existingExcerpt?: string, limit: number = 200): string {
    if (existingExcerpt) return existingExcerpt;
    if (!content) return '';

    try {
        const data = JSON.parse(content);
        if (data && Array.isArray(data.blocks)) {
            // It's Editor.js JSON
            const textBlock = data.blocks.find(
                (b: any) => b.type === 'paragraph' || b.type === 'header'
            );
            if (textBlock) {
                // Strip HTML tags and decode common entities
                const plainText = textBlock.data.text
                    .replace(/<[^>]+>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"');
                return plainText.substring(0, limit) + (plainText.length > limit ? '...' : '');
            }
            return 'Click to read post...'; // Fallback if only images/custom blocks
        }
    } catch (e) {
        // Not JSON, assume legacy plain text/markdown
    }

    // Fallback for legacy text
    return content.substring(0, limit) + (content.length > limit ? '...' : '');
}
