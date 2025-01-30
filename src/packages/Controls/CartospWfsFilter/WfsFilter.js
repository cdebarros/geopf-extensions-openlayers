// import CSS
import "../../CSS/Controls/CartospWfsFilter/GPFwfsFilter.css";

// import OpenLayers
import Widget from "../Widget";
import Control from "../Control";

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

            // ajout des evenements sur la carte
            // pour les futurs ajouts de couche
            if (this.auto) {
                this.addEventsListeners(map);
            }
        } else {
            // suppression des evenements sur la carte
            // pour les futurs suppressions de couche
            if (this.auto) {
                this.removeEventsListeners();
            }
        }

        // on appelle la méthode setMap originale d'OpenLayers
        super.setMap(map);

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
        layer.setStyle(function (feature) {
            thematique = feature.getProperties().thematique;
            typologie = feature.getProperties().typologie_service;
            if (self.selectedTypologies.find(theme => theme.typologies.includes(feature.getProperties().typologie_service))) {
                //if ( self.selectedTypologies[feature.getProperties().thematique].includes(feature.getProperties().typologie_service)){
                return self.cartospStyles[feature.getProperties().thematique];
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

        this.eventsListeners = [];

        // Cartosp WFS layer name
        this.cartospLayerName = this.options.cartospLayerName;

        // tableau des styles
        // ex.
        // {
        //   "class1": {
        //     new ol.style.Style,
        //   },     
        //   "class2": {
        //     new ol.style.Style,
        //   } 
        // }  
        this.cartospStyles = this.options.cartospStyles;

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
        if (this.cartospStyles){
            this.cartospFilterList = [];
            this.selectedTypologies = [];
            for (const [key, value] of Object.entries(this.cartospStyles)) {
                this.cartospFilterList.push({ thematique : key, typologies : [] });
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

    /**
     * Add events listeners on map (called by setMap)
     *
     * @param {*} map - map
     * @private
     * @todo listener on change:position
     */
    addEventsListeners (map) {
        var self = this;
        // on movend update SP list
        this.eventsListeners["view:change"] = function (e) {
            logger.trace(e);
            // TODO
            // à la modification de l'ordre de la couche, on modifie l'entrée
            // * du DOM
            // * de la liste des entrées
            self.cartospFilterList.forEach((entry) => {
                entry.typologies = [];
                entry.dom = "";
            });
            self.getMap().getLayers().forEach((layer) => {
                if (layer.name == self.cartospLayerName) {
                    var featureTheme ;
                    var extent = self.getMap().getView().calculateExtent(self.getMap().getSize());
                    layer.getSource().forEachFeatureInExtent(extent, function (feature){
                        featureTheme = self.cartospFilterList.find(element => element.thematique == feature.getProperties().thematique);
                        if (!featureTheme.typologies.includes(feature.getProperties().typologie_service)) {
                            featureTheme.typologies.push(feature.getProperties().typologie_service);
                        }
                    }); 
                    self.updateFilters();
                }
            });
        };

        map.getView().on("change", this.eventsListeners["view:change"]);
    }

    /**
     * Remove events listeners on map (called by setMap)
     * @private
     */
    removeEventsListeners () {
        var map = this.getMap();
        map.getView().un("change", this.eventsListeners["view:change"]);
        delete this.eventsListeners["view:change"];
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
