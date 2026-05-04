import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, CheckboxControl, ToggleControl } from '@wordpress/components';
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

        const sourceLabel = {
            all:              'Tutti i post',
            current_category: 'Categoria corrente',
            fixed_categories: 'Categorie specifiche',
        };

        const selected     = attributes.selectedCategories ?? [];
        const selectedCount = selected.length;

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Post da mostrare">
                        <SelectControl
                            label="Sorgente"
                            value={ attributes.postSource }
                            options={ [
                                { label: 'Tutti i post',          value: 'all' },
                                { label: 'Categoria corrente',    value: 'current_category' },
                                { label: 'Categorie specifiche',  value: 'fixed_categories' },
                            ] }
                            onChange={ ( val ) => setAttributes( { postSource: val } ) }
                        />
                        { attributes.postSource === 'fixed_categories' &&
                            ( categories ?? [] ).map( ( cat ) => (
                                <CheckboxControl
                                    key={ cat.id }
                                    label={ cat.name }
                                    checked={ selected.includes( cat.id ) }
                                    onChange={ ( checked ) => {
                                        const next = checked
                                            ? [ ...selected, cat.id ]
                                            : selected.filter( ( id ) => id !== cat.id );
                                        setAttributes( { selectedCategories: next } );
                                    } }
                                />
                            ) )
                        }
                    </PanelBody>
                    <PanelBody title="Interfaccia">
                        <ToggleControl
                            label="Mostra filtri"
                            checked={ attributes.showFilters ?? true }
                            onChange={ ( val ) => setAttributes( { showFilters: val } ) }
                        />
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    <p><strong>Post List</strong></p>
                    <p style={ { fontSize: '0.85em', opacity: 0.65, marginTop: '0.5rem' } }>
                        { sourceLabel[ attributes.postSource ] ?? sourceLabel.all }
                        { attributes.postSource === 'fixed_categories' && selectedCount > 0 &&
                            ` · ${ selectedCount } ${ selectedCount === 1 ? 'categoria' : 'categorie' }`
                        }
                    </p>
                </div>
            </>
        );
    },

    save: () => null,
} );
