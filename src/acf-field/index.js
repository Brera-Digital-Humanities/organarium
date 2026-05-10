import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl } from '@wordpress/components';
import './style.scss';
import metadata from './block.json';

const FIELDS = [
    { key: 'data',                label: 'Data',                variant: 'standard' },
    { key: 'ubicazione',          label: 'Ubicazione',          variant: 'standard' },
    { key: 'autore',              label: 'Autore',              variant: 'standard' },
    { key: 'tecnica_e_materiali', label: 'Tecnica e materiali', variant: 'standard' },
    { key: 'dimensioni',          label: 'Dimensioni',          variant: 'standard' },
    { key: 'edizione',            label: 'Edizione',            variant: 'standard' },
    { key: 'trattato_completo',   label: 'Trattato completo',   variant: 'standard' },
    { key: 'provenienza',         label: 'Provenienza',         variant: 'flush' },
    { key: 'fonti',               label: 'Fonti',               variant: 'top-border' },
];

const VARIANT_OPTIONS = [
    { label: 'Standard (bordo inferiore + margin-bottom)', value: 'standard' },
    { label: 'Senza bordi (flush)',                         value: 'flush' },
    { label: 'Bordo superiore',                             value: 'top-border' },
];

registerBlockType( metadata.name, {

    edit: ( { attributes, setAttributes } ) => {
        const blockProps = useBlockProps( {
            style: {
                padding: '1rem',
                background: '#f2f2e5',
                border: '1px dashed rgba(0,0,0,0.2)',
            },
        } );

        const onFieldChange = ( fieldKey ) => {
            const preset    = FIELDS.find( ( f ) => f.key === fieldKey );
            const isPreset  = FIELDS.some( ( f ) => f.label === attributes.label );
            const labelKept = attributes.label && ! isPreset;
            setAttributes( {
                fieldKey,
                label:   labelKept ? attributes.label : preset?.label   ?? '',
                variant: preset?.variant ?? 'standard',
            } );
        };

        const fieldOptions = [
            { label: '— Seleziona campo —', value: '' },
            ...FIELDS.map( ( f ) => ( {
                label: `${ f.label } (${ f.key })`,
                value: f.key,
            } ) ),
        ];

        const previewLabel = attributes.fieldKey
            ? ( attributes.label || attributes.fieldKey )
            : '(nessun campo selezionato)';

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Campo">
                        <SelectControl
                            label="Campo ACF"
                            value={ attributes.fieldKey }
                            options={ fieldOptions }
                            onChange={ onFieldChange }
                        />
                        <TextControl
                            label="Etichetta visualizzata"
                            value={ attributes.label }
                            onChange={ ( label ) => setAttributes( { label } ) }
                            help="Mostrata in grassetto prima del valore."
                        />
                        <SelectControl
                            label="Variante grafica"
                            value={ attributes.variant }
                            options={ VARIANT_OPTIONS }
                            onChange={ ( variant ) => setAttributes( { variant } ) }
                        />
                    </PanelBody>
                </InspectorControls>

                <div { ...blockProps }>
                    <p style={ { margin: 0, fontSize: '0.85em' } }>
                        <strong>Campo ACF</strong> · { previewLabel }
                    </p>
                    <p style={ { margin: '0.25rem 0 0', fontSize: '0.75em', opacity: 0.65 } }>
                        Variante: { attributes.variant } · se vuoto non viene emesso alcun markup
                    </p>
                </div>
            </>
        );
    },

    save: () => null,
} );
