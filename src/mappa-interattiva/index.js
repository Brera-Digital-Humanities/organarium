import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl } from '@wordpress/components';
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

        const styleLabels = {
            natural: 'Chiaro naturale',
            warm:    'Caldo bruciato',
            teal:    'Freddo teal',
            dark:    'Scuro terroso',
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
                    <PanelBody title="Aspetto mappa">
                        <RangeControl
                            label="Altezza mappa (px)"
                            value={ attributes.mapHeight }
                            onChange={ ( val ) => setAttributes( { mapHeight: val } ) }
                            min={ 300 }
                            max={ 900 }
                            step={ 20 }
                        />
                        <SelectControl
                            label="Filtro colore tile"
                            value={ attributes.mapStyle }
                            options={ [
                                { label: 'Chiaro naturale', value: 'natural' },
                                { label: 'Caldo bruciato',  value: 'warm' },
                                { label: 'Freddo teal',     value: 'teal' },
                                { label: 'Scuro terroso',   value: 'dark' },
                            ] }
                            onChange={ ( val ) => setAttributes( { mapStyle: val } ) }
                        />
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    <p><strong>Mappa Interattiva</strong></p>
                    <p style={ { fontSize: '0.85em', opacity: 0.65, marginTop: '0.5rem' } }>
                        { sourceLabel[ attributes.postSource ] ?? sourceLabel.all }
                        { ' · ' }
                        { styleLabels[ attributes.mapStyle ] ?? styleLabels.natural }
                        { ' · ' + attributes.mapHeight + 'px' }
                    </p>
                </div>
            </>
        );
    },

    save: () => null,
} );
