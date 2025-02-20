// import CSS
import "../../CSS/Controls/CartospWfsFilter/GPFwfsFilter.css";

// import OpenLayers
import Widget from "../Widget";
import Control from "../Control";
import {
    Style,
    Icon
} from "ol/style";

// import local
import Utils from "../../Utils/Helper";
import SelectorID from "../../Utils/SelectorID";
import Logger from "../../Utils/LoggerByDefault";
import Draggable from "../../Utils/Draggable";

// DOM
import WfsFilterDOM from "./WfsFilterDOM";

var logger = Logger.getLogger("wfsfilter");

/**
 * @classdesc
 *
 * WfsFilter button
 *
 * @constructor
 * @alias ol.control.WfsFilter
 * @type {ol.control.WfsFilter}
 * @extends {ol.control.Control}
 * @param {Object} options - options for function call.
 *
 * @fires view:change
 * @example
 * var wfsfilter = new ol.control.WfsFilter();
 * map.addControl(wfsfilter);
 */
var WfsFilter = class Wfsfilter extends Control {

    /**
     * See {@link ol.control.WfsFilter}
     * @module WfsFilter
     * @alias module:~controls/WfsFilter
     * @param {Object} [options] - options
     * @example
     * import WfsFilter from "gpf-ext-ol/controls/WfsFilter"
     * ou
     * import { WfsFilter } from "gpf-ext-ol"
     */
    constructor (options) {
        options = options || {};

        // call ol.control.Control constructor
        super(options);

        if (!(this instanceof WfsFilter)) {
            throw new TypeError("ERROR CLASS_CONSTRUCTOR");
        }
        /**
         * Nom de la classe (heritage)
         * @private
         */
        this.CLASSNAME = "Wfsfilter";
        // initialisation du composant
        this.initialize(options);

        // Widget main DOM container
        this.container = this.initContainer();

        // ajout du container
        (this.element) ? this.element.appendChild(this.container) : this.element = this.container;

        return this;
    }

    // ################################################################### //
    // ##################### public methods ############################## //
    // ################################################################### //

    /**
     * Overwrite OpenLayers setMap method
     *
     * @param {ol.Map} map - Map.
     */
    setMap (map) {
        if (map) {
            // mode "draggable"
            if (this.draggable) {
                Draggable.dragElement(
                    this.panelWfsfilterContainer,
                    this.panelWfsfilterHeaderContainer,
                    map.getTargetElement()
                );
            }
            // mode "collapsed"
            if (!this.collapsed) {
                this.buttonWfsfilterShow.setAttribute("aria-pressed", true);
            }
            // Initialisation style et filtres
            if (this.auto) {
                var self = this;
                map.getLayers().forEach((layer) => {
                    if (layer.name == this.cartospLayerName) {
                        self.updateFilters();
                        self.setStyleFunction(layer);
                    }
                });
            }

            // on appelle la méthode setMap originale d'OpenLayers
            super.setMap(map);
        } 

        // position
        if (this.options.position) {
            this.setPosition(this.options.position);
        }

        // reunion du bouton avec le précédent
        if (this.options.gutter === false) {
            this.getContainer().classList.add("gpf-button-no-gutter");
        }
    }

    /**
     * Get container
     *
     * @returns {DOMElement} container
     */
    getContainer () {
        return this.container;
    }

    // ################################################################### //
    // ################### getters / setters ############################# //
    // ################################################################### //

    /**
     * Update SP liste DOM
     * 
     * @public
     */
    updateFilters () {
        var atLeastOne = false;
        var frag = new DocumentFragment();

        // construction de l'accordeon
        this.cartospFilterList.forEach(element => {
            if (element.typologies.length > 0) {
                var entry = this._createThematiqueEntry(element);
                if (entry) {
                    frag.appendChild(entry);
                    atLeastOne = true;
                }
            }
        });

        // affichage du contenu dans le conteneur de départ
        if (!atLeastOne){
            this.panelWfsfilterEntriesContainer.innerHTML = "";
            this.panelWfsfilterEntriesContainer.prepend(this._createEmptyThematique());
        } else {
            var replacement = this._createWfsfilterElement();
            replacement.appendChild(frag);
            this.PanelWfsfilterContentElement.replaceChild(replacement, this.panelWfsfilterEntriesContainer);
            this.panelWfsfilterEntriesContainer = replacement;
        }
    }

    /**
     * Set a new style function from selected typologies
     * @param {*} layer  - Cartosp WFS layer
     * @public
     */
    setStyleFunction (layer) {
        var self = this;
        var thematique;
        var typologie;
        var featureTheme;
        var featureStructure;
        layer.setStyle(function (feature) {
            thematique = feature.getProperties().service_thematique;
            typologie = feature.getProperties().service_typologie;
            featureStructure = feature.getProperties().type_structure.toLowerCase();
            if (self.selectedTypologies.find(theme => theme.typologies.includes(feature.getProperties().service_typologie))) {
                if (featureStructure !== "implantation" && featureStructure !== "itinérant" &&  featureStructure !== "permanence"){
                    featureStructure = "implantation";
                }
                return new Style({
                    image : new Icon({
                        anchor : [0.5, 37],
                        anchorXUnits : "fraction",
                        anchorYUnits : "pixels",
                        src : self.cartospThemesInfo[feature.getProperties().service_thematique].markerPath + featureStructure + ".svg",
                    })
                });
            };
            return undefined;
        });
    }

    updateSelectSpCount () {
        var self = this;
        var count = 0;
        self.selectedTypologies.forEach((theme) => {
            count += theme.typologies.length;
        });

        self.WfsThematiqueResetLink.innerHTML = "Réinitialiser (" + count + ")";
    }

    // ################################################################### //
    // #################### privates methods ############################# //
    // ################################################################### //

    /**
     * Initialize WfsFilter control (called by WfsFilter constructor)
     *
     * @param {Object} options - constructor options
     * @private
     */
    initialize (options) {
        this.uid = options.id || SelectorID.generate();

        // set default options
        this.options = {
            collapsed : true,
            draggable : false,
            auto : true,
            panel : false
        };

        // merge with user options
        Utils.assign(this.options, options);

        /** {Boolean} specify if control is collapsed (true) or not (false) */
        this.collapsed = this.options.collapsed;

        /** {Boolean} specify if control is draggable (true) or not (false) */
        this.draggable = this.options.draggable;

        /** {Boolean} specify if control add layers auto */
        this.auto = this.options.auto;

        this.buttonWfsfilterShow = null;
        this.panelWfsfilterContainer = null;
        this.panelWfsfilterEntriesContainer = null; // c'est là où on ajoute nos entrées Cartosp !
        this.panelWfsfilterHeaderContainer = null; // c'est pour le dragNdrop
        this.panelWfsfilterHeaderTitleContainer = null;
        this.buttonWfsfilterClose = null; // utile ?
        this.PanelWfsfilterContentElement = null;
        this.WfsThematiqueResetLink = null;

        // Cartosp WFS layer name
        this.cartospLayerName = this.options.cartospLayerName;

        // tableau des Themes
        // ex.
        // {
        //   "theme1": {
        //     markerPath : String - chemin relatif vers le dossier des marker cartosp,
        //     topologies: [] - Liste des topologies de services pour le thème
        //   },     
        //   "theme2": {
        //     markerPath: String - chemin relatif vers le dossier des marker cartosp,
        //     topologies: [] - Liste des topologies de services pour le thème
        //   } 
        // }
        this.cartospThemesInfo = this.options.cartospThemesInfo;

        // tableau des filtres
        // ex.
        // [
        //   {
        //     thematique: string,
        //     typologies: []string
        //   },     
        //   {
        //     thematique: string,
        //     typologies: []string
        //   } 
        // ]  
        if (this.cartospThemesInfo){
            this.cartospFilterList = [];
            this.selectedTypologies = [];
            for (const [key, value] of Object.entries(this.cartospThemesInfo)) {
                this.cartospFilterList.push({ thematique : key, typologies : value.topologies });
                this.selectedTypologies.push({ thematique : key, typologies : [] });
            }
        }
    }

    /**
     * Create control main container (DOM initialize)
     *
     * @returns {DOMElement} DOM element
     * @private
     */
    initContainer () {
        // create main container
        var container = this._createMainContainerElement();

        var picto = this.buttonWfsfilterShow = this._createShowWfsfilterPictoElement();
        container.appendChild(picto);

        // panel
        // dialog element
        var wfsfilterPanel = this.panelWfsfilterContainer = this._createWfsfilterPanelElement();
        
        // Body dialog
        var wfsfilterPanelDiv = this._createWfsfilterPanelDivElement();
        wfsfilterPanel.appendChild(wfsfilterPanelDiv);

        // header with close button
        var wfsfilterPanelHeader = this.panelWfsfilterHeaderContainer = this._createWfsfilterPanelHeaderElement();
        var wfsfilterCloseBtn = this.buttonWfsfilterClose = this._createWfsfilterPanelCloseElement();
        wfsfilterPanelHeader.appendChild(wfsfilterCloseBtn);
        wfsfilterPanelDiv.appendChild(wfsfilterPanelHeader);
        

        // Content with title + reset buttton and SP entries
        var WfsfilterContentDiv = this.PanelWfsfilterContentElement = this._createWfsfilterPanelContentElement();
        wfsfilterPanelDiv.appendChild(WfsfilterContentDiv);

        var WfsfilterHeaderContainerTitleDiv = this.panelWfsfilterHeaderTitleContainer = this._createWfsfilterPanelTitleDivElement();
        WfsfilterContentDiv.appendChild(WfsfilterHeaderContainerTitleDiv);
        var WfsThematiqueResetLinkDiv = this.WfsThematiqueResetLink = this._createThematiqueResetLink();
        WfsfilterContentDiv.appendChild(WfsThematiqueResetLinkDiv);

        var wfsfilterEntriesDiv = this.panelWfsfilterEntriesContainer = this._createWfsfilterElement();
        WfsfilterContentDiv.appendChild(wfsfilterEntriesDiv);

        container.appendChild(wfsfilterPanel);

        logger.log(container);

        return container;
    }

    // ################################################################### //
    // ######################## event dom ################################ //
    // ################################################################### //
    /**
     * ...
     * @param {*} e - ...
     */
    onShowWfsfilterClick (e) {
        if (e.target.ariaPressed === "true") {
            this.onPanelOpen();
        }
        logger.trace(e);
        var opened = this.buttonWfsfilterShow.ariaPressed;
        this.collapsed = !(opened === "true");
        this.dispatchEvent("change:collapsed");
        // on recalcule la position
        if (this.options.position && !this.collapsed) {
            this.updatePosition(this.options.position);
        }
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecSpClick (e) {
        var self = this;
        var featureTheme = self.selectedTypologies.find(element => element.thematique == e.target.name.split("checkboxes-").pop());
        if (self.selectedTypologies.find(featureTheme => featureTheme.typologies.includes(e.target.value))) {
            featureTheme.typologies=featureTheme.typologies.filter(subject => !([e.target.value].includes(subject)));
        } else {
            featureTheme.typologies.push(e.target.value);
        }
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });
        self.updateSelectSpCount ();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onResetSelecSpClick (e) {
        var self = this;
        self.selectedTypologies.forEach((theme) => {
            theme.typologies = [];
        });
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
                self.updateFilters();
            }
        });
        self.WfsThematiqueResetLink.innerHTML = "Réinitialiser (0)";
    }

};

// on récupère les méthodes de la classe DOM
Object.assign(WfsFilter.prototype, WfsFilterDOM);
Object.assign(WfsFilter.prototype, Widget);

export default WfsFilter;

// Expose Export as ol.control.WfsFilter (for a build bundle)
if (window.ol && window.ol.control) {
    window.ol.control.WfsFilter = WfsFilter;
}
