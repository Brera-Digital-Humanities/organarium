import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
    return (
        <div { ...useBlockProps( { className: 'wp-block-ttf-child-featured-zoom' } ) }>
            <div style={ { padding: '20px', background: '#ddd', textAlign: 'center' } }>
                <strong>Featured Image Zoom</strong>
                <p>L'immagine apparirà nel frontend (il Site Editor non supporta lo zoom interattivo).</p>
            </div>
        </div>
    );
}