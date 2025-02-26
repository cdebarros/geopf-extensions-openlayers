// import CSS
import "../../CSS/Controls/CartospIndicator/GPFindicator.css";

// import OpenLayers
import Widget from "../Widget";
import Control from "../Control";
import GeoportalWMS from "../../Layers/LayerWMS";

// import local
import Utils from "../../Utils/Helper";
import SelectorID from "../../Utils/SelectorID";
import Logger from "../../Utils/LoggerByDefault";
import Draggable from "../../Utils/Draggable";

// DOM
import IndicatorDOM from "./IndicatorDOM";

var logger = Logger.getLogger("indicator");

/**
 * @classdesc
 *
 * Indicator button
 *
 * @constructor
 * @alias ol.control.Indicator
 * @type {ol.control.Indicator}
 * @extends {ol.control.Control}
 * @param {Object} options - options for function call.
 *
 * @fires view:change
 * @example
 * var indicator = new ol.control.Indicator();
 * map.addControl(Indicator);
 */
var Indicator = class Indicator extends Control {

    /**
     * See {@link ol.control.Indicator}
     * @module Indicator
     * @alias module:~controls/Indicator
     * @param {Object} [options] - options
     * @example
     * import Indicator from "gpf-ext-ol/controls/Indicator"
     * ou
     * import { Indicator } from "gpf-ext-ol"
     */
    constructor (options) {
        options = options || {};

        // call ol.control.Control constructor
        super(options);

        if (!(this instanceof Indicator)) {
            throw new TypeError("ERROR CLASS_CONSTRUCTOR");
        }
        /**
         * Nom de la classe (heritage)
         * @private
         */
        this.CLASSNAME = "Indicator";
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
                    this.panelIndicatorContainer,
                    this.panelIndicatorHeaderContainer,
                    map.getTargetElement()
                );
            }
            // mode "collapsed"
            if (!this.collapsed) {
                this.buttonIndicatorShow.setAttribute("aria-pressed", true);
            }
            // Initialisation style et filtres
            if (this.auto) {
                var self = this;
                self.createFilters();
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
    createFilters () {
        var atLeastOne = false;
        var frag = new DocumentFragment();

        // construction de l'accordeon
        this.indicatorFilterList.forEach(element => {
            if (element.indicators.length > 0) {
                var entry = this._createThematiqueEntry(element);
                if (entry) {
                    frag.appendChild(entry);
                    atLeastOne = true;
                }
            }
        });

        // affichage du contenu dans le conteneur de départ
        if (!atLeastOne){
            this.panelIndicatorEntriesContainer.innerHTML = "";
            this.panelIndicatorEntriesContainer.prepend(this._createEmptyThematique());
        } else {
            var replacement = this._createIndicatorElement();
            replacement.appendChild(frag);
            this.PanelIndicatorContentElement.replaceChild(replacement, this.panelIndicatorEntriesContainer);
            this.panelIndicatorEntriesContainer = replacement;
        }
    }

    updateSelectSpCount () {
        var self = this;
        var count = 0;
        self.selectedIndicators.forEach((theme) => {
            count += theme.indicators.length;
        });

        self.WfsThematiqueResetLink.firstChild.innerHTML = "Réinitialiser (" + count + ")";
    }

    // ################################################################### //
    // #################### privates methods ############################# //
    // ################################################################### //

    /**
     * Initialize Indicator control (called by Indicator constructor)
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

        this.buttonIndicatorShow = null;
        this.panelIndicatorContainer = null;
        this.panelIndicatorEntriesContainer = null; // c'est là où on ajoute nos entrées Cartosp !
        this.panelIndicatorHeaderContainer = null; // c'est pour le dragNdrop
        this.panelIndicatorHeaderTitleContainer = null;
        this.buttonIndicatorClose = null; // utile ?
        this.PanelIndicatorContentElement = null;
        this.WfsThematiqueResetLink = null;

        this.eventsListeners = [];

        // tableau des indicateurs
        // ex.
        // [
        //   {
        //     thematique: string,
        //     indicators: [{title : String, layername: String}]Objects
        //   },     
        //   {
        //     thematique: string,
        //     indicators: [{title : String, layername: String}]Objects
        //   } 
        // ]  
        if (this.options.indicatorList){
            this.indicatorFilterList = this.options.indicatorList;
            this.selectedIndicators = [];

            this.indicatorFilterList.forEach((indicator) => {
                this.selectedIndicators.push({ thematique : indicator.thematique, indicators : [] });
            });
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

        var picto = this.buttonIndicatorShow = this._createShowIndicatorPictoElement();
        container.appendChild(picto);

        // panel
        // dialog element
        var indicatorPanel = this.panelIndicatorContainer = this._createIndicatorPanelElement();
        
        // Body dialog
        var indicatorPanelDiv = this._createIndicatorPanelDivElement();
        indicatorPanel.appendChild(indicatorPanelDiv);

        // header with close button
        var indicatorPanelHeader = this.panelIndicatorHeaderContainer = this._createIndicatorPanelHeaderElement();
        var indicatorCloseBtn = this.buttonIndicatorClose = this._createIndicatorPanelCloseElement();
        indicatorPanelHeader.appendChild(indicatorCloseBtn);
        indicatorPanelDiv.appendChild(indicatorPanelHeader);
        

        // Content with title + reset buttton and SP entries
        var IndicatorContentDiv = this.PanelIndicatorContentElement = this._createIndicatorPanelContentElement();
        indicatorPanelDiv.appendChild(IndicatorContentDiv);

        var IndicatorHeaderContainerTitleDiv = this.panelIndicatorHeaderTitleContainer = this._createIndicatorPanelTitleDivElement();
        IndicatorContentDiv.appendChild(IndicatorHeaderContainerTitleDiv);
        var WfsThematiqueResetLinkDiv = this.WfsThematiqueResetLink = this._createThematiqueResetLink();
        IndicatorContentDiv.appendChild(WfsThematiqueResetLinkDiv);

        var indicatorEntriesDiv = this.panelIndicatorEntriesContainer = this._createIndicatorElement();
        IndicatorContentDiv.appendChild(indicatorEntriesDiv);

        container.appendChild(indicatorPanel);

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
    onShowIndicatorClick (e) {
        if (e.target.ariaPressed === "true") {
            this.onPanelOpen();
        }
        logger.trace(e);
        var opened = this.buttonIndicatorShow.ariaPressed;
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
        var featureTheme = self.selectedIndicators.find(element => element.thematique == e.target.name.split("checkboxes-").pop());
        if (self.selectedIndicators.find(featureTheme => featureTheme.indicators.includes(e.target.value))) {
            self.getMap().getAllLayers().some(layer => {
                if (layer.name && layer.name == e.target.value){
                    self.getMap().removeLayer(layer);
                    return true;
                }
            });
            featureTheme.indicators=featureTheme.indicators.filter(subject => !([e.target.value].includes(subject)));
        } else {
            var layernew = new GeoportalWMS({ layer : e.target.value });        
            self.getMap().addLayer(layernew);
            featureTheme.indicators.push(e.target.value);
        }
        self.updateSelectSpCount ();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onResetSelecSpClick (e) {
        var self = this;
        self.selectedIndicators.forEach((theme) => {
            theme.indicators.forEach((indicator) => {
                self.getMap().getAllLayers().forEach((layer) => {
                    if (layer.name && layer.name == indicator){
                        self.getMap().removeLayer(layer);
                    }
                });
                document.getElementById("checkboxes-" + indicator).checked = false;
            });
            theme.indicators = [];
        });
        self.WfsThematiqueResetLink.firstChild.innerHTML = "Réinitialiser (0)";
    }

};

// on récupère les méthodes de la classe DOM
Object.assign(Indicator.prototype, IndicatorDOM);
Object.assign(Indicator.prototype, Widget);

export default Indicator;

// Expose Export as ol.control.Indicator (for a build bundle)
if (window.ol && window.ol.control) {
    window.ol.control.Indicator = Indicator;
}
