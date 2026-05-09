import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RadioControl, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import './style.scss';
import metadata from './block.json';

registerBlockType( metadata.name, {

    edit: ( { attributes, setAttributes } ) => {
        const blockProps = useBlockProps( {
            style: { padding: '2rem', background: '#f2f2e5', textAlign: 'center' },
        } );

        const categories = useSelect( ( select ) =>
            select( 'core' ).getEntityRecords( 'taxonomy', 'category', { per_page: -1, _fields: 'id,name' } ) ?? []
        , [] );

        const viewLabel = {
            both:     'Timeline + Griglia',
            timeline: 'Solo Timeline',
            grid:     'Solo Griglia',
        };

        const sourceLabel = {
            all:              'Tutti i post',
            current_category: 'Categoria corrente',
            fixed_category:   categories?.find( ( c ) => c.id === attributes.selectedCategory )?.name ?? 'Categoria specifica',
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Post da mostrare">
                        <SelectControl
                            label="Sorgente"
                            value={ attributes.postSource }
                            options={ [
                                { label: 'Tutti i post',        value: 'all' },
                                { label: 'Categoria corrente',  value: 'current_category' },
                                { label: 'Categoria specifica', value: 'fixed_category' },
                            ] }
                            onChange={ ( val ) => setAttributes( { postSource: val } ) }
                        />
                        { attributes.postSource === 'fixed_category' && (
                            <SelectControl
                                label="Categoria"
                                value={ attributes.selectedCategory }
                                options={ [
                                    { label: '— scegli —', value: 0 },
                                    ...( categories ?? [] ).map( ( c ) => ( { label: c.name, value: c.id } ) ),
                                ] }
                                onChange={ ( val ) => setAttributes( { selectedCategory: Number( val ) } ) }
                            />
                        ) }
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
                        { attributes.allowedViews !== 'grid' && (
                            <ToggleControl
                                label="Mostra scrubber"
                                checked={ attributes.showScrubber ?? true }
                                onChange={ ( val ) => setAttributes( { showScrubber: val } ) }
                            />
                        ) }
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    <p><strong>Timeline 3D</strong></p>
                    <p style={ { fontSize: '0.85em', opacity: 0.65, marginTop: '0.5rem' } }>
                        { sourceLabel[ attributes.postSource ] ?? sourceLabel.all }
                        { ' · ' }
                        { viewLabel[ attributes.allowedViews ] }
                    </p>
                </div>
            </>
        );
    },

    save: () => null,
} );
