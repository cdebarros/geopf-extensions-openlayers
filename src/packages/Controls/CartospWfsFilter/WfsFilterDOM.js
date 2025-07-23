var WfsFilterDOM = {

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
        container.id = this._addUID("GPwfsfilter");
        container.className = "GPwidget gpf-widget gpf-widget-button gpf-mobile-fullscreen";
        return container;
    },

    // ################################################################### //
    // ################### Methods of main container ##################### //
    // ################################################################### //

    /**
     * Show Wfsfilter
     *
     * @returns {DOMElement} DOM element
     */
    _createShowWfsfilterPictoElement : function () {
        // contexte d'execution
        var self = this;

        var button = document.createElement("button");
        // INFO: Ajout d'une SPAN pour enlever des marges de 6px dans CHROMIUM (?!)
        var span = document.createElement("span");
        button.appendChild(span);
        button.id = this._addUID("GPshowWfsfilterPicto");
        button.className = "GPshowOpen GPshowAdvancedToolPicto GPshowWfsfilterPicto gpf-btn gpf-btn--tertiary gpf-btn-icon gpf-btn-icon-wfsfilter fr-btn fr-btn--tertiary";
        button.setAttribute("aria-label", "Services publics");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-pressed", false);
        button.setAttribute("type", "button");

        // Close all results and panels when minimizing the widget
        if (button.addEventListener) {
            button.addEventListener("click", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowWfsfilterClick(e);
            });
        } else if (button.attachEvent) {
            button.attachEvent("onclick", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowWfsfilterClick(e);
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
    _createWfsfilterPanelElement : function () {
        var dialog = document.createElement("dialog");
        dialog.id = this._addUID("GPwfsfilterPanel");
        dialog.className = "GPpanel gpf-panel fr-modal";

        return dialog;
    },

    _createWfsfilterPanelDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__wfsfilter fr-modal__body";
        return div;
    },

    _createWfsfilterPanelContentElement : function () {
        var div = document.createElement("div");
        div.className = "fr-modal__content";
        return div;
    },

    _createWfsfilterPanelTitleDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__title__wfsfilter fr-modal__title fr-icon-cartosp-building";
        div.innerHTML = " Services Publics";
        return div;
    },

    /**
     * Create Header Panel
     *
     * @returns {DOMElement} DOM element
     */
    _createWfsfilterPanelHeaderElement : function () {
        var container = document.createElement("div");
        container.className = "gpf-panel__header_wfsfilter fr-modal__header";
        return container;
    },
    _createWfsfilterPanelCloseElement : function () {
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
                document.getElementById(self._addUID("GPshowWfsfilterPicto")).click();
            }, false);
        } else if (btnClose.attachEvent) {
            btnClose.attachEvent("onclick", function () {
                document.getElementById(self._addUID("GPshowWfsfilterPicto")).click();
            });
        }

        return btnClose;
    },

    // ################################################################### //
    // ####################### Methods dynamics ########################## //
    // ################################################################### //

    _createFilterDiv : function () {
        var element = document.createElement("div");
        element.id = "filters";

        // label
        var label = document.createElement("div");
        label.innerHTML = "Filtres :";
        label.id = "filter-label";

        // reset
        var reset = document.createElement("button");
        reset.className = "fr-link margin-link zero-count"; // afficher en dsfr
        reset.innerText = "Réinitialiser (0)";
        reset.title = "Réinitialiser la sélection de filtres";
        reset.id = "reset-filter-selection";

        reset.addEventListener("click", (e) => {
            this.onResetSelecFilterClick(e);
        });

        element.appendChild(label);
        element.appendChild(reset);

        return element;
    },

    _createFilterInfosDiv : function () {
        // info
        var infos = document.createElement("div");
        infos.innerHTML = "Les filtres s'appliquent seulement aux services publics ayant la donnée disponible. <br><br> Lorsqu'un filtre est activé, seuls les services correspondants à la catégorie sélectionnée s'affichent.";
        infos.className = "fr-callout";
        infos.id = "filter-infos";

        return infos;
    },

    _createFilterContent : function () {
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

        // accordeon section for each thematique
        var strContainer = `
            <div id="filters-content">
                <div class="filter-title">Caractéristiques du service</div>
                <div class="fr-fieldset__element">
                    <div class="fr-checkbox-group">
                        <input value="Implantation" name="filtersp-spcara" id="filtersp-Implantation" type="checkbox">
                        <label class="fr-label" for="filtersp-Implantation">
                            Implantation
                        </label>
                    </div>
                </div>
                <div class="fr-fieldset__element">
                    <div class="fr-checkbox-group">
                        <input value="Permanence" name="filtersp-spcara" id="filtersp-Permanence" type="checkbox">
                        <label class="fr-label" for="filtersp-Permanence">
                            Permanence
                        </label>
                    </div>
                </div>
                <div class="fr-fieldset__element">
                    <div class="fr-checkbox-group">
                        <input value="Itinérance" name="filtersp-spcara" id="filtersp-Itinérance" type="checkbox">
                        <label class="fr-label" for="filtersp-Itinérance">
                            Dispositif itinérant
                        </label>
                    </div>
                </div>
                <div id="spfilter-more-content" style="display: none;">
                    <div class="filter-title">Volume horaire (par semaine)</div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Moins de 10h" name="filtersp-spvolume" id="filtersp-Moins de 10h" type="checkbox">
                            <label class="fr-label" for="filtersp-Moins de 10h">
                                Moins de 10 heures
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Entre 10h et 24h" name="filtersp-spvolume" id="filtersp-Entre 10h et 24h" type="checkbox">
                            <label class="fr-label" for="filtersp-Entre 10h et 24h">
                                Entre 10 et 24 heures
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Plus de 24h" name="filtersp-spvolume" id="filtersp-Plus de 24h" type="checkbox">
                            <label class="fr-label" for="filtersp-Plus de 24h">
                                Plus de 24 heures
                            </label>
                        </div>
                    </div>
                    <div class="filter-title">Modalité d'accueil</div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Avec rendez-vous" name="filtersp-spmoda" id="filtersp-Avec rendez-vous" type="checkbox">
                            <label class="fr-label" for="filtersp-Avec rendez-vous">
                                Avec rendez-vous
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Sans rendez-vous" name="filtersp-spmoda" id="filtersp-Sans rendez-vous" type="checkbox">
                            <label class="fr-label" for="filtersp-Sans rendez-vous">
                                Sans rendez-vous
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Avec et sans rendez-vous" name="filtersp-spmoda" id="filtersp-Avec et sans rendez-vous" type="checkbox">
                            <label class="fr-label" for="filtersp-Avec et sans rendez-vous">
                                Avec et sans rendez-vous
                            </label>
                        </div>
                    </div>
                    <div class="filter-title">Fréquentation (visiteurs par an)</div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Moins de 100" name="filtersp-spfreq" id="filtersp-Moins de 100" type="checkbox">
                            <label class="fr-label" for="filtersp-Moins de 100">
                                Moins de 100
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="De 100 à 999" name="filtersp-spfreq" id="filtersp-De 100 à 999" type="checkbox">
                            <label class="fr-label" for="filtersp-De 100 à 999">
                                De 100 à 999
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="De 1000 à 4999" name="filtersp-spfreq" id="filtersp-De 1000 à 4999" type="checkbox">
                            <label class="fr-label" for="filtersp-De 1000 à 4999">
                                De 1000 à 4999
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="De 5000 à 9999" name="filtersp-spfreq" id="filtersp-De 5000 à 9999" type="checkbox">
                            <label class="fr-label" for="filtersp-De 5000 à 9999">
                                De 5000 à 9999
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="De 10000 à 49999" name="filtersp-spfreq" id="filtersp-De 10000 à 49999" type="checkbox">
                            <label class="fr-label" for="filtersp-De 10000 à 49999">
                                De 10000 à 49999
                            </label>
                        </div>
                    </div>
                    <div class="fr-fieldset__element">
                        <div class="fr-checkbox-group">
                            <input value="Plus de 50000" name="filtersp-spfreq" id="filtersp-Plus de 50000" type="checkbox">
                            <label class="fr-label" for="filtersp-Plus de 50000">
                                Plus de 50000
                            </label>
                        </div>
                    </div>
                </div>
                <button class="fr-link margin-link" name="spfilter-more" id="filtersp-more">Afficher plus de filtres &#709;</button>
            </div>
        `;

        // Final HTML content
        var entry = stringToHTML(strContainer);

        // Use shadow dom to attach eventlister for checboxes and accordeon
        const shadow = entry.attachShadow({ mode : "open" });
        shadow.innerHTML = strContainer.trim();

        // checkbox event click
        var inputSpcara = shadow.querySelectorAll("[name=filtersp-spcara]");
        inputSpcara.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecFilterCaracClick(e);
            });
        });

        var inputVolume = shadow.querySelectorAll("[name=filtersp-spvolume]");
        inputVolume.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecFilterVolumeClick(e);
            });
        });

        var inputModa = shadow.querySelectorAll("[name=filtersp-spmoda]");
        inputModa.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecFilterModaClick(e);
            });
        });

        var inputFreq = shadow.querySelectorAll("[name=filtersp-spfreq]");
        inputFreq.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecFilterFreqClick(e);
            });
        });

        // checkbox event click
        var inputMore = shadow.querySelector("[name=spfilter-more]");
        inputMore.addEventListener("click", (e) => {
            var element = document.getElementById("spfilter-more-content");
            if (element.style.display === "none") {
                element.style.display = "inline";
                e.target.innerHTML = "Afficher moins de filtres &#708;";
            } else {
                element.style.display = "none";
                e.target.innerHTML = "Afficher plus de filtres &#709;";
            }
        });

        return shadow;
    },

    _createThematiqueResetLink : function () {
        var element = document.createElement("div");
        element.id = "allSpSelectors";

        // select
        var select = document.createElement("button");
        select.className = "fr-link"; // afficher en dsfr
        select.innerText = "Tout sélectionner";
        select.title = "Sélectionner toutes les typologies";
        select.id = "select-sp-selection";

        select.addEventListener("click", (e) => {
            this.onSelecAllSpClick(e);
        });

        // reset
        var reset = document.createElement("button");
        reset.className = "fr-link zero-count"; // afficher en dsfr
        reset.innerText = "Réinitialiser (0)";
        reset.title = "Réinitialiser la sélection de services publics";
        reset.id = "reset-sp-selection";

        reset.addEventListener("click", (e) => {
            this.onResetSelecSpClick(e);
        });

        element.appendChild(select);
        element.appendChild(reset);

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
        content+=`<button title="Sélectionner toutes les typologies du thème" class="fr-link margin-link" value="${o.thematique}" name="checkboxes-all-${o.thematique}" id="checkboxes-all-${o.thematique}">Tout sélectionner</button>`;
        o.typologies.forEach(typologie_service => {
            content+=`<div class="fr-fieldset__element">
                <div class="fr-checkbox-group">
                    <input value="${typologie_service}" name="checkboxes-${o.thematique}" id="checkboxes-${typologie_service}" type="checkbox">
                    <label class="fr-label" for="checkboxes-${typologie_service}">
                        ${typologie_service}
                    </label>
                </div>
            </div>`;
        });

        // accordeon section for each thematique
        var strContainer = `
            <section id="${o.thematique}" class="fr-accordion">
                <h3 class="fr-accordion__title" style="height: 48px;">
                    <button id="GPcollapseWfsfilter_ID_${o.thematique}" class="GPfilterButton fr-accordion__btn" aria-expanded="false" aria-controls="GPwfsfilter_ID_${o.thematique}">${o.thematique} (${o.typologies.length})</button>
                </h3>
                <div id="GPwfsfilter_ID_${o.thematique}" class="fr-collapse GPelementHidden" style="margin:unset;">
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
                var element = document.getElementById("GPwfsfilter_ID_" + o.thematique);
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

        // checkbox all event click
        var inputName = `checkboxes-all-${o.thematique}`;
        var inputs = shadow.querySelectorAll("[name=" + "\"" + inputName + "\"]");
        inputs.forEach((input) => {
            input.addEventListener("click", (e) => {
                this.onSelecAllSpThemeClick(e);
            });
        });

        return shadow;
    },

    _createEmptyThematique : function () {
        var div = document.createElement("div");
        div.className = "wfsfilter-entry-container gpf-panel__content";
        div.id="GPwfsfilter_ID_empty";
        div.innerHTML = "Aucun service public visible sur la carte veuillez zoomer sur une localisation qui vous interesse afin de faire apparaitre une sélection de thèmes";
        return div;
    },

    _createWfsfilterElement : function () {
        var div = document.createElement("div");
        div.className = "wfsfilter-entries fr-accordions-group";
        return div;
    },

};

export default WfsFilterDOM;
