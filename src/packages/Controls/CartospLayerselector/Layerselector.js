// import CSS
import "../../CSS/Controls/CartospLayerselector/GPFlayerselector.css";

// import OpenLayers
import Widget from "../Widget";
import Control from "../Control";
import GeoportalWMS from "../../Layers/LayerWMS";
import GeoportalTMS from "../../Layers/LayerMapBox";

// import local
import Utils from "../../Utils/Helper";
import SelectorID from "../../Utils/SelectorID";
import Logger from "../../Utils/LoggerByDefault";
import Draggable from "../../Utils/Draggable";

// DOM
import LayerselectorDOM from "./LayerselectorDOM";

var logger = Logger.getLogger("layerselector");

/**
 * @classdesc
 *
 * Layerselector button
 *
 * @constructor
 * @alias ol.control.Layerselector
 * @type {ol.control.Layerselector}
 * @extends {ol.control.Control}
 * @param {Object} options - options for function call.
 *
 * @fires view:change
 * @example
 * var layerselector = new ol.control.Layerselector();
 * map.addControl(layerselector);
 */
var Layerselector = class Layerselector extends Control {

    /**
     * See {@link ol.control.Layerselector}
     * @module Layerselector
     * @alias module:~controls/Layerselector
     * @param {Object} [options] - options
     * @example
     * import Layerselector from "gpf-ext-ol/controls/Layerselector"
     * ou
     * import { Layerselector } from "gpf-ext-ol"
     */
    constructor (options) {
        options = options || {};

        // call ol.control.Control constructor
        super(options);

        if (!(this instanceof Layerselector)) {
            throw new TypeError("ERROR CLASS_CONSTRUCTOR");
        }
        /**
         * Nom de la classe (heritage)
         * @private
         */
        this.CLASSNAME = "Layerselector";
        // initialisation du composant
        this.initialize(options);

        // Widget main DOM container
        this.container = this.initContainer();

        // ajout du container
        (this.element) ? this.element.appendChild(this.container) : this.element = this.container;

        // Set element ID to match the regex pattern for Widget panel management
        this.element.id = this._addUID("GPlayerselector");

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
                    this.panelLayerselectorContainer,
                    this.panelLayerselectorHeaderContainer,
                    map.getTargetElement()
                );
            }
            // mode "collapsed"
            if (!this.collapsed) {
                this.buttonLayerselectorShow.setAttribute("aria-pressed", true);
            }
            // Initialisation style et filtres
            if (this.auto) {
                var self = this;
            }
        }

        // on appelle la méthode setMap originale d'OpenLayers
        super.setMap(map);

        // on créer les selecteurs
        self.createSelector();

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
    createSelector () {
        var self = this;
        var currentLayers = [];
        self.getMap().getLayers().forEach((layer) => {
            currentLayers.push(layer.name);
        });
        var entries = this._createSelectorEntries(self.layerSelectorList, currentLayers);
        this.panelLayerselectorEntriesContainer.appendChild(entries);
    }

    // ################################################################### //
    // #################### privates methods ############################# //
    // ################################################################### //

    /**
     * Initialize Layerselector control (called by Layerselector constructor)
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

        this.buttonLayerselectorShow = null;
        this.panelLayerselectorContainer = null;
        this.panelLayerselectorEntriesContainer = null; // c'est là où on ajoute nos entrées Cartosp !
        this.panelLayerselectorHeaderContainer = null; // c'est pour le dragNdrop
        this.buttonLayerselectorClose = null; // utile ?
        this.PanelLayerselectorContentElement = null;

        // Layer Selector list
        // [
        //  {layername: String, title: String, layertype: String(WMS||TMS), style: String(only for TMS), img: "" }, 
        //  {layername: String, title: String, layertype: String, style: String(only for TMS), img: "" },    
        // ]
        this.layerSelectorList = this.options.layerSelectorList;

        this.layerSelectorListNames = this.layerSelectorList.map(function (value) {
            return value.layername;
        });
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

        var picto = this.buttonLayerselectorShow = this._createShowLayerselectorPictoElement();
        container.appendChild(picto);

        // panel
        // dialog element
        var layerselectorPanel = this.panelLayerselectorContainer = this._createLayerselectorPanelElement();
        
        // Body dialog
        var layerselectorPanelDiv = this._createLayerselectorPanelDivElement();
        layerselectorPanel.appendChild(layerselectorPanelDiv);

        // header with close button
        var layerselectorPanelHeader = this.panelLayerselectorHeaderContainer = this._createLayerselectorPanelHeaderElement();
        var layerselectorCloseBtn = this.buttonLayerselectorClose = this._createLayerselectorPanelCloseElement();
        layerselectorPanelHeader.appendChild(layerselectorCloseBtn);
        layerselectorPanelDiv.appendChild(layerselectorPanelHeader);
        

        // Content with title + reset buttton and SP entries
        var LayerselectorContentDiv = this.PanelLayerselectorContentElement = this._createLayerselectorPanelContentElement();
        layerselectorPanelDiv.appendChild(LayerselectorContentDiv);


        var layerselectorEntriesDiv = this.panelLayerselectorEntriesContainer = this._createLayerselectorElement();
        LayerselectorContentDiv.appendChild(layerselectorEntriesDiv);

        container.appendChild(layerselectorPanel);

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
    onShowLayerselectorClick (e) {
        if (e.target.ariaPressed === "true") {
            this.onPanelOpen();
        }
        logger.trace(e);
        var opened = this.buttonLayerselectorShow.ariaPressed;
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
    onSelecLayerChange (e) {
        var self = this;
        var layerToAdd = null;
        var layersCollection = self.getMap().getLayers();
        var allLayers = layersCollection.getArray();
        var managedLayers = allLayers.filter((layer) => self.layerSelectorListNames.includes(layer.name));
        var selectedLayer = null;
        var newlayer = null;
        var layersToRemove = [];
        var selectedIndex = -1;

        // find layer info to add
        layerToAdd = self.layerSelectorList.find((element) => element.layername === e.target.value);
        if (!layerToAdd) {
            return;
        }

        // reuse existing layer when available
        selectedLayer = managedLayers.find((layer) => layer.name === layerToAdd.layername);

        // otherwise create it once and insert it where the active baselayer is
        if (!selectedLayer) {
            if (layerToAdd.layertype === "TMS") {
                newlayer = new GeoportalTMS({ layer : layerToAdd.layername, style : layerToAdd.style });
            } else {
                newlayer = new GeoportalWMS({ layer : layerToAdd.layername });
            }
            layersCollection.push(newlayer);
            selectedLayer = newlayer;
        }

        // collect only previously managed selector layers except the selected one
        layersToRemove = managedLayers.filter((layer) => layer !== selectedLayer);

        // ensure selected baselayer is visible
        selectedLayer.setVisible(true);

        // remove only previous selector baselayers from map
        layersToRemove.forEach((layer) => {
            layersCollection.remove(layer);
        });

        // ensure selected baselayer is at the last index of the collection
        selectedIndex = layersCollection.getArray().indexOf(selectedLayer);
        if (selectedIndex !== layersCollection.getLength() - 1) {
            layersCollection.remove(selectedLayer);
            layersCollection.push(selectedLayer);
        }

        // set low zIndex on selected layer to render at bottom
        selectedLayer.setZIndex(0);
    }

};

// on récupère les méthodes de la classe DOM
Object.assign(Layerselector.prototype, LayerselectorDOM);
Object.assign(Layerselector.prototype, Widget);

export default Layerselector;

// Expose Export as ol.control.Layerselector (for a build bundle)
if (window.ol && window.ol.control) {
    window.ol.control.Layerselector = Layerselector;
}
