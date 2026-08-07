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

        // Set element ID to match the regex pattern for Widget panel management
        this.element.id = this._addUID("GPwfsfilter");

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
                        self.createFilters();
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
    createFilters () {
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
        var featureStructure;
        layer.setStyle(function (feature) {
            thematique = feature.getProperties().thematique;
            typologie = feature.getProperties().typologie;
            featureStructure = feature.getProperties().type_structure.toLowerCase();
            if (featureStructure == "implantation" || "itinérance" || "permanence") {
                if (
                    self.spFilters.sptopo.includes(feature.getProperties().typologie) &&
                    (self.spFilters.spcarac.length == 0 || self.spFilters.spcarac.includes(feature.getProperties().type_structure)) &&
                    (self.spFilters.spvolume.length == 0 || self.spFilters.spvolume.includes(feature.getProperties().categorie_niveau_d_ouverture)) &&
                    (self.spFilters.spmoda.length == 0 || self.spFilters.spmoda.includes(feature.getProperties().modalite_d_accueil)) &&
                    (self.spFilters.spfreq.length == 0 || self.spFilters.spfreq.includes(feature.getProperties().frequentation_categorie))                
                ) {
                    return new Style({
                        image : new Icon({
                            anchor : [0.5, 37],
                            anchorXUnits : "fraction",
                            anchorYUnits : "pixels",
                            src : self.cartospThemesInfo[feature.getProperties().thematique].markerPath + featureStructure + ".svg",
                        })
                    });
                };
            }
            return undefined;
        });
    }

    updateSelectSpCount () {
        this.WfsThematiqueResetLink.lastChild.innerHTML = "Réinitialiser (" + this.spFilters.sptopo.length + ")";
        if (this.spFilters.sptopo.length == 0) {
            this.WfsThematiqueResetLink.lastChild.classList.add("zero-count");
        } else {
            this.WfsThematiqueResetLink.lastChild.classList.remove("zero-count");
        }
    }

    updateSelectFilterCount () {
        var count = this.spFilters.spcarac.length + this.spFilters.spfreq.length + this.spFilters.spmoda.length + this.spFilters.spvolume.length;
        this.filterContainerDiv.lastChild.innerHTML = "Réinitialiser (" + count + ")";
        if (count == 0) {
            this.filterContainerDiv.lastChild.classList.add("zero-count");
        } else {
            this.filterContainerDiv.lastChild.classList.remove("zero-count");
        }
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
        this.buttonWfsfilterClose = null; // utile ?
        this.PanelWfsfilterContentElement = null;
        this.WfsThematiqueResetLink = null;
        this.filterContainerDiv = null;
        this.filterContentDiv = null;
        this.filterInfosDiv = null;

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
            this.spFilters = { sptopo : [], spcarac : [], spvolume : [], spmoda : [], spfreq : []};
            for (const [key, value] of Object.entries(this.cartospThemesInfo)) {
                this.cartospFilterList.push({ thematique : key, typologies : value.topologies });
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

        var WfsFilterFilterContainerDiv = this.filterContainerDiv = this._createFilterDiv();
        WfsfilterContentDiv.appendChild(WfsFilterFilterContainerDiv);

        var WfsFilterFilterInfosDiv = this.filterInfosDiv = this._createFilterInfosDiv();
        WfsfilterContentDiv.appendChild(WfsFilterFilterInfosDiv);

        var WfsFilterFilterContentDiv = this.filterContentDiv = this._createFilterContent();
        WfsfilterContentDiv.appendChild(WfsFilterFilterContentDiv);

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
        if (this.spFilters.sptopo.includes(e.target.value)) {
            this.spFilters.sptopo.splice(this.spFilters.sptopo.indexOf(e.target.value), 1);
        } else {
            this.spFilters.sptopo.push(e.target.value); 
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
    onSelecFilterCaracClick (e) {
        if (this.spFilters.spcarac.includes(e.target.value)) {
            this.spFilters.spcarac.splice(this.spFilters.spcarac.indexOf(e.target.value), 1);
        } else {
            this.spFilters.spcarac.push(e.target.value); 
        }

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });
        this.updateSelectFilterCount();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecFilterVolumeClick (e) {
        if (this.spFilters.spvolume.includes(e.target.value)) {
            this.spFilters.spvolume.splice(this.spFilters.spvolume.indexOf(e.target.value), 1);
        } else {
            this.spFilters.spvolume.push(e.target.value); 
        }

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });
        this.updateSelectFilterCount();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecFilterModaClick (e) {
        if (this.spFilters.spmoda.includes(e.target.value)) {
            this.spFilters.spmoda.splice(this.spFilters.spmoda.indexOf(e.target.value), 1);
        } else {
            this.spFilters.spmoda.push(e.target.value); 
        }

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });
        this.updateSelectFilterCount();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecFilterFreqClick (e) {
        if (this.spFilters.spfreq.includes(e.target.value)) {
            this.spFilters.spfreq.splice(this.spFilters.spfreq.indexOf(e.target.value), 1);
        } else {
            this.spFilters.spfreq.push(e.target.value); 
        }

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });
        this.updateSelectFilterCount();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecAllSpThemeClick (e) {
        var filteredList = [...new Set([...this.spFilters.sptopo, ...this.cartospFilterList.find(filter => filter.thematique == e.target.value).typologies])];
        
        filteredList.forEach((typologie) => {
            document.getElementById("checkboxes-" + typologie).checked = true;
        });
        
        this.spFilters.sptopo = filteredList;

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });

        this.updateSelectSpCount ();
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onSelecAllSpClick (e) {
        var self = this;
        this.spFilters.sptopo = [];
        self.cartospFilterList.forEach((theme) => {
            theme.typologies.forEach((typologie) => {
                document.getElementById("checkboxes-" + typologie).checked = true;
                self.spFilters.sptopo.push(typologie);
            });
        });

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
    onResetSelecFilterClick (e) {
        // reset spcarac
        this.spFilters.spcarac.forEach((filter) => {
            document.getElementById("filtersp-" + filter).checked = false;
        });
        this.spFilters.spcarac = [];

        // reset spvolume
        this.spFilters.spvolume.forEach((filter) => {
            document.getElementById("filtersp-" + filter).checked = false;
        });
        this.spFilters.spvolume = [];

        // reset spmoda
        this.spFilters.spmoda.forEach((filter) => {
            document.getElementById("filtersp-" + filter).checked = false;
        });
        this.spFilters.spmoda = [];

        // reset spfreq
        this.spFilters.spfreq.forEach((filter) => {
            document.getElementById("filtersp-" + filter).checked = false;
        });
        this.spFilters.spfreq = [];

        // update style
        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });

        this.filterContainerDiv.lastChild.innerHTML = "Réinitialiser (0)";
        this.filterContainerDiv.lastChild.classList.add("zero-count");
    }

    /**
     * ...
     * @param {*} e - ...
     * @private
     */
    onResetSelecSpClick (e) {
        this.spFilters.sptopo.forEach((typologie) => {
            document.getElementById("checkboxes-" + typologie).checked = false;
        });
        this.spFilters.sptopo = [];

        var self = this;
        self.getMap().getLayers().forEach((layer) => {
            if (layer.name == self.cartospLayerName) {
                self.setStyleFunction(layer);
            }
        });

        this.WfsThematiqueResetLink.lastChild.innerHTML = "Réinitialiser (0)";
        this.WfsThematiqueResetLink.lastChild.classList.add("zero-count");
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
