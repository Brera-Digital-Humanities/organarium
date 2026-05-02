import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RadioControl } from '@wordpress/components';
import './style.scss';
import metadata from './block.json';

registerBlockType( metadata.name, {

    edit: ( { attributes, setAttributes } ) => {
        const blockProps = useBlockProps( {
            style: { padding: '2rem', background: '#f2f2e5', textAlign: 'center' },
        } );

        const viewLabel = {
            both:     'Timeline + Griglia',
            timeline: 'Solo Timeline',
            grid:     'Solo Griglia',
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Post da mostrare">
                        <SelectControl
                            label="Sorgente"
                            value={ attributes.postSource }
                            options={ [
                                { label: 'Tutti i post',       value: 'all' },
                                { label: 'Categoria corrente', value: 'current_category' },
                            ] }
                            onChange={ ( val ) => setAttributes( { postSource: val } ) }
                        />
                    </PanelBody>
                    <PanelBody title="Visualizzazioni">
                        <RadioControl
                            label="Viste disponibili"
                            selected={ attributes.allowedViews }
                            options={ [
                                { label: 'Entrambe (timeline + griglia)', value: 'both' },
                                { label: 'Solo timeline',                  value: 'timeline' },
                                { label: 'Solo griglia',                   value: 'grid' },
                            ] }
                            onChange={ ( val ) => setAttributes( { allowedViews: val } ) }
                        />
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    <p><strong>Timeline 3D</strong></p>
                    <p style={ { fontSize: '0.85em', opacity: 0.65, marginTop: '0.5rem' } }>
                        { attributes.postSource === 'all' ? 'Tutti i post' : 'Categoria corrente' }
                        { ' · ' }
                        { viewLabel[ attributes.allowedViews ] }
                    </p>
                </div>
            </>
        );
    },

    save: () => null,
} );
