var IndicatorDOM = {

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
        container.id = this._addUID("GPindicator");
        container.className = "GPwidget gpf-widget gpf-widget-button gpf-mobile-fullscreen";
        return container;
    },

    // ################################################################### //
    // ################### Methods of main container ##################### //
    // ################################################################### //

    /**
     * Show Indicator
     *
     * @returns {DOMElement} DOM element
     */
    _createShowIndicatorPictoElement : function () {
        // contexte d'execution
        var self = this;

        var button = document.createElement("button");
        // INFO: Ajout d'une SPAN pour enlever des marges de 6px dans CHROMIUM (?!)
        var span = document.createElement("span");
        button.appendChild(span);
        button.id = this._addUID("GPshowIndicatorPicto");
        button.className = "GPshowOpen GPshowAdvancedToolPicto GPshowIndicatorPicto gpf-btn gpf-btn--tertiary gpf-btn-icon gpf-btn-icon-indicator fr-btn fr-btn--tertiary";
        button.setAttribute("aria-label", "Indicateurs");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-pressed", false);
        button.setAttribute("type", "button");

        // Close all results and panels when minimizing the widget
        if (button.addEventListener) {
            button.addEventListener("click", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowIndicatorClick(e);
            });
        } else if (button.attachEvent) {
            button.attachEvent("onclick", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowIndicatorClick(e);
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
    _createIndicatorPanelElement : function () {
        var dialog = document.createElement("dialog");
        dialog.id = this._addUID("GPindicatorPanel");
        dialog.className = "GPpanel gpf-panel fr-modal";

        return dialog;
    },

    _createIndicatorPanelDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__indicator fr-modal__body";
        return div;
    },

    _createIndicatorPanelContentElement : function () {
        var div = document.createElement("div");
        div.className = "fr-modal__content";
        return div;
    },

    _createIndicatorPanelTitleDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__title__indicator fr-modal__title fr-icon-cartosp-indicator";
        div.innerHTML = " Indicateurs";
        return div;
    },

    /**
     * Create Header Panel
     *
     * @returns {DOMElement} DOM element
     */
    _createIndicatorPanelHeaderElement : function () {
        var container = document.createElement("div");
        container.className = "gpf-panel__header_indicator fr-modal__header";
        return container;
    },
    _createIndicatorPanelCloseElement : function () {
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
                document.getElementById(self._addUID("GPshowIndicatorPicto")).click();
            }, false);
        } else if (btnClose.attachEvent) {
            btnClose.attachEvent("onclick", function () {
                document.getElementById(self._addUID("GPshowIndicatorPicto")).click();
            });
        }

        return btnClose;
    },

    // ################################################################### //
    // ####################### Methods dynamics ########################## //
    // ################################################################### //

    _createThematiqueResetLink : function () {
        var element = document.createElement("button");
        element.className = "fr-link"; // afficher en dsfr
        element.innerText = "Réinitialiser (0)";
        element.id = "reset-sp-selection";

        element.addEventListener("click", (e) => {
            this.onResetSelecSpClick(e);
        });

        return element;
    },

    _createThematiqueEntry : function (o) {
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

        // create checkboxes by typologie_services
        var content = "";
        o.indicators.forEach(indicator => {
            var checked = this.selectedIndicators.find(theme => theme.indicators.includes(indicator));
            content+=`<div class="fr-fieldset__element">
                <div class="fr-checkbox-group">
                    <input value="${indicator.layername}" name="checkboxes-${o.thematique}" id="checkboxes-${indicator.layername}" type="checkbox" ${checked ? "checked": ""}>
                    <label class="fr-label" for="checkboxes-${indicator.layername}">
                        ${indicator.title}
                    </label>
                </div>
            </div>`;
        });

        // accordeon section for each thematique
        var strContainer = `
            <section id="${o.thematique}" class="fr-accordion">
                <h3 class="fr-accordion__title" style="height: 48px;">
                    <button id="GPcollapseIndicator_ID_${o.thematique}" class="GPfilterButton fr-accordion__btn" aria-expanded="false" aria-controls="GPindicator_ID_${o.thematique}">${o.thematique} (${o.indicators.length})</button>
                </h3>
                <div id="GPindicator_ID_${o.thematique}" class="fr-collapse GPelementHidden" style="margin:unset;">
                    <fieldset class="fr-fieldset" id="checkboxes-${o.thematique}">
                        ${content}
                    </fieldset>
                </div>
            </section>
        `;

        // Final HTML content
        var entry = stringToHTML(strContainer);

        // Use shadow dom to attach eventlister for checboxes and accordeon
        const shadow = entry.attachShadow({ mode : "open" });
        shadow.innerHTML = strContainer.trim();

        // accordeon dropdown event click
        var button = shadow.querySelector("button, button.fr-accordion__btn");
        if (button) {
            button.addEventListener("click", (e) => {
                var status = (e.target.ariaExpanded === "true");
                e.target.setAttribute("aria-expanded", !status);
                var element = document.getElementById("GPindicator_ID_" + o.thematique);
                if (status) {
                    element.classList.remove("fr-collapse--expanded");
                    element.classList.add("GPelementHidden");
                } else {
                    element.classList.add("fr-collapse--expanded");
                    element.classList.remove("GPelementHidden");
                }
            });
        }
        
        // checkbox event click
        var inputName = `checkboxes-${o.thematique}`;
        var inputs = shadow.querySelectorAll("[name=" + "\"" + inputName + "\"]");
        inputs.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecSpClick(e);
            });
        });

        return shadow;
    },

    _createEmptyThematique : function () {
        var div = document.createElement("div");
        div.className = "indicator-entry-container gpf-panel__content";
        div.id="GPindicator_ID_empty";
        div.innerHTML = "Aucun service public visible sur la carte veuillez zoomer sur une localisation qui vous interesse afin de faire apparaitre une sélection de thèmes";
        return div;
    },

    _createIndicatorElement : function () {
        var div = document.createElement("div");
        div.className = "indicator-entries fr-accordions-group";
        return div;
    },

};

export default IndicatorDOM;
