// import CSS
import "../../CSS/Controls/CartospSearchdialog/GPFsearchdialog.css";

// import OpenLayers
import Widget from "../Widget";
import Control from "../Control";
import GeoportalWMS from "../../Layers/LayerWMS";
import SearchEngine from "../../Controls/SearchEngine/SearchEngine";

// import local
import Utils from "../../Utils/Helper";
import SelectorID from "../../Utils/SelectorID";
import Logger from "../../Utils/LoggerByDefault";
import Draggable from "../../Utils/Draggable";

// DOM
import SearchdialogDOM from "./SearchdialogDOM";

var logger = Logger.getLogger("searchdialog");

/**
 * @classdesc
 *
 * Searchdialog button
 *
 * @constructor
 * @alias ol.control.Searchdialog
 * @type {ol.control.Searchdialog}
 * @extends {ol.control.Control}
 * @param {Object} options - options for function call.
 *
 * @fires view:change
 * @example
 * var searchdialog = new ol.control.Searchdialog();
 * map.addControl(Searchdialog);
 */
var Searchdialog = class Searchdialog extends Control {

    /**
     * See {@link ol.control.Searchdialog}
     * @module Searchdialog
     * @alias module:~controls/Searchdialog
     * @param {Object} [options] - options
     * @example
     * import Searchdialog from "gpf-ext-ol/controls/Searchdialog"
     * ou
     * import { Searchdialog } from "gpf-ext-ol"
     */
    constructor (options) {
        options = options || {};

        // call ol.control.Control constructor
        super(options);

        if (!(this instanceof Searchdialog)) {
            throw new TypeError("ERROR CLASS_CONSTRUCTOR");
        }
        /**
         * Nom de la classe (heritage)
         * @private
         */
        this.CLASSNAME = "Searchdialog";
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
                    this.panelSearchdialogContainer,
                    this.panelSearchdialogHeaderContainer,
                    map.getTargetElement()
                );
            }
            // mode "collapsed"
            if (!this.collapsed) {
                this.buttonSearchdialogShow.setAttribute("aria-pressed", true);
            }
            // Initialisation style et filtres
            if (this.auto) {
                var self = this;
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
    // #################### privates methods ############################# //
    // ################################################################### //

    /**
     * Initialize Searchdialog control (called by Searchdialog constructor)
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

        this.buttonSearchdialogShow = null;
        this.panelSearchdialogContainer = null;
        this.panelSearchdialogEntriesContainer = null; // c'est là où on ajoute nos entrées Cartosp !
        this.panelSearchdialogHeaderContainer = null; // c'est pour le dragNdrop
        this.panelSearchdialogHeaderTitleContainer = null;
        this.buttonSearchdialogClose = null; // utile ?
        this.PanelSearchdialogContentElement = null;

        this.eventsListeners = [];
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

        var picto = this.buttonSearchdialogShow = this._createShowSearchdialogPictoElement();
        container.appendChild(picto);

        // panel
        // dialog element
        var searchdialogPanel = this.panelSearchdialogContainer = this._createSearchdialogPanelElement();
        
        // Body dialog
        var searchdialogPanelDiv = this._createSearchdialogPanelDivElement();
        searchdialogPanel.appendChild(searchdialogPanelDiv);

        // header with close button
        var searchdialogPanelHeader = this.panelSearchdialogHeaderContainer = this._createSearchdialogPanelHeaderElement();
        var searchdialogCloseBtn = this.buttonSearchdialogClose = this._createSearchdialogPanelCloseElement();
        searchdialogPanelHeader.appendChild(searchdialogCloseBtn);
        searchdialogPanelDiv.appendChild(searchdialogPanelHeader);
        
        // Content with title + reset buttton and SP entries
        var SearchdialogContentDiv = this.PanelSearchdialogContentElement = this._createSearchdialogPanelContentElement();
        searchdialogPanelDiv.appendChild(SearchdialogContentDiv);

        var SearchdialogHeaderContainerTitleDiv = this.panelSearchdialogHeaderTitleContainer = this._createSearchdialogPanelTitleDivElement();
        SearchdialogContentDiv.appendChild(SearchdialogHeaderContainerTitleDiv);

        container.appendChild(searchdialogPanel);

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
    onShowSearchdialogClick (e) {
        if (e.target.ariaPressed === "true") {
            this.onPanelOpen();
        }
        logger.trace(e);
        var opened = this.buttonSearchdialogShow.ariaPressed;
        this.collapsed = !(opened === "true");
        this.dispatchEvent("change:collapsed");
        // on recalcule la position
        if (this.options.position && !this.collapsed) {
            this.updatePosition(this.options.position);
        }
    }

};

// on récupère les méthodes de la classe DOM
Object.assign(Searchdialog.prototype, SearchdialogDOM);
Object.assign(Searchdialog.prototype, Widget);

export default Searchdialog;

// Expose Export as ol.control.Searchdialog (for a build bundle)
if (window.ol && window.ol.control) {
    window.ol.control.Searchdialog = Searchdialog;
}
