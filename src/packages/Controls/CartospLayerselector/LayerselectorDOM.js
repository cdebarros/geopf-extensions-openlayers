var LayerselectorDOM = {

    /**
    * Add uuid to the tag ID
    * @param {String} id - id selector
    * @returns {String} uid - id selector with an unique id
    */
    _addUID : function (id) {
        var uid = (this.uid) ? id + "-" + this.uid : id;
        return uid;
    },

    /**
     * Main container (DOM)
     *
     * @returns {DOMElement} DOM element
     */
    _createMainContainerElement : function () {
        var container = document.createElement("div");
        container.id = this._addUID("GPlayerselector");
        container.className = "GPwidget gpf-widget gpf-widget-button gpf-mobile-fullscreen";
        return container;
    },

    // ################################################################### //
    // ################### Methods of main container ##################### //
    // ################################################################### //

    /**
     * Show Layerselector
     *
     * @returns {DOMElement} DOM element
     */
    _createShowLayerselectorPictoElement : function () {
        // contexte d'execution
        var self = this;

        var button = document.createElement("button");
        // INFO: Ajout d'une SPAN pour enlever des marges de 6px dans CHROMIUM (?!)
        var span = document.createElement("span");
        button.appendChild(span);
        button.id = this._addUID("GPshowLayerselectorPicto");
        button.className = "GPshowOpen GPshowAdvancedToolPicto GPshowLayerselectorPicto gpf-btn gpf-btn--tertiary gpf-btn-icon gpf-btn-icon-layerselector fr-btn fr-btn--tertiary";
        button.setAttribute("aria-label", "Changer de fond de carte");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-pressed", false);
        button.setAttribute("type", "button");

        // Close all results and panels when minimizing the widget
        if (button.addEventListener) {
            button.addEventListener("click", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowLayerselectorClick(e);
            });
        } else if (button.attachEvent) {
            button.attachEvent("onclick", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowLayerselectorClick(e);
            });
        }

        return button;
    },

    // ################################################################### //
    // ################### Methods of panel container #################### //
    // ################################################################### //

    /**
     * Create Container Panel
     *
     * @returns {DOMElement} DOM element
     */
    _createLayerselectorPanelElement : function () {
        var dialog = document.createElement("dialog");
        dialog.id = this._addUID("GPlayerselectorPanel");
        dialog.className = "GPpanel gpf-panel fr-modal";

        return dialog;
    },

    _createLayerselectorPanelDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__layerselector fr-modal__body";
        return div;
    },

    _createLayerselectorPanelContentElement : function () {
        var div = document.createElement("div");
        return div;
    },

    /**
     * Create Header Panel
     *
     * @returns {DOMElement} DOM element
     */
    _createLayerselectorPanelHeaderElement : function () {
        var container = document.createElement("div");
        container.className = "gpf-panel__header_layerselector fr-modal__header";
        return container;
    },
    _createLayerselectorPanelCloseElement : function () {
        // contexte
        var self = this;

        var btnClose = document.createElement("button");
        btnClose.className = "gpf-btn gpf-btn-icon-close fr-btn--close fr-btn fr-btn--tertiary-no-outline";
        btnClose.title = "Fermer le panneau";

        var span = document.createElement("span");
        span.className = "GPelementHidden gpf-visible"; // afficher en dsfr
        span.innerText = "Fermer";

        btnClose.appendChild(span);

        // Link panel close / visibility checkbox
        if (btnClose.addEventListener) {
            btnClose.addEventListener("click", function () {
                document.getElementById(self._addUID("GPshowLayerselectorPicto")).click();
            }, false);
        } else if (btnClose.attachEvent) {
            btnClose.attachEvent("onclick", function () {
                document.getElementById(self._addUID("GPshowLayerselectorPicto")).click();
            });
        }

        return btnClose;
    },

    // ################################################################### //
    // ####################### Methods dynamics ########################## //
    // ################################################################### //

    _createSelectorEntries : function (o, l) {
        const stringToHTML = (str) => {
            var support = function () {
                if (!window.DOMParser) {
                    return false;
                }
                var parser = new DOMParser();
                try {
                    parser.parseFromString("x", "text/html");
                } catch (err) {
                    return false;
                }
                return true;
            };

            // If DOMParser is supported, use it
            if (support()) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(str, "text/html");
                return doc.body;
            }

            // Otherwise, fallback to old-school method
            var dom = document.createElement("div");
            dom.innerHTML = str;
            return dom;
        };

        // create selector by layer
        var content = "";
        var inputcheck = "";
        o.forEach(layer => {
            if (l.includes(layer.layername)){
                inputcheck = `<input type="radio" name="layerselect" value="${layer.layername}" checked />`;
            } else {
                inputcheck = `<input type="radio" name="layerselect" value="${layer.layername}" />`;
            }
            content+=`<div class="radio">
                <label title="Fond qui sera appliqué : ${layer.layername}">` + inputcheck + 
                    `<img src="${layer.img}" alt="layer-${layer.title}" class="img-thumbnail" />
                    <div class="sub-label">${layer.title}</div>
                </label>  
            </div>`;
        });

        // accordeon section for each thematique
        var strContainer = `
            <div id="layerlist">
                <div id="GPlayerselector_ID_layerlist">
                    ${content}
                </div>
            </div>
        `;

        // Final HTML content
        var entries = stringToHTML(strContainer);
        
        // checkbox event click
        var inputs = entries.querySelectorAll("[name=\"layerselect\"]");
        inputs.forEach((input) => {
            input.addEventListener("change", (e) => {
                this.onSelecLayerChange(e);
            });
        });

        return entries;
    },

    _createLayerselectorElement : function () {
        var div = document.createElement("div");
        div.className = "layerselector-entries";
        return div;
    },

};

export default LayerselectorDOM;
