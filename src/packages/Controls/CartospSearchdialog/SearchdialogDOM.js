var SearchdialogDOM = {

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
        container.id = this._addUID("GPsearchdialog");
        container.className = "GPwidget gpf-widget gpf-widget-button gpf-mobile-fullscreen";
        return container;
    },

    // ################################################################### //
    // ################### Methods of main container ##################### //
    // ################################################################### //

    /**
     * Show Searchdialog
     *
     * @returns {DOMElement} DOM element
     */
    _createShowSearchdialogPictoElement : function () {
        // contexte d'execution
        var self = this;

        var button = document.createElement("button");
        // INFO: Ajout d'une SPAN pour enlever des marges de 6px dans CHROMIUM (?!)
        var span = document.createElement("span");
        button.appendChild(span);
        button.id = this._addUID("GPshowSearchdialogPicto");
        button.className = "GPshowOpen GPshowAdvancedToolPicto GPshowSearchdialogPicto gpf-btn gpf-btn--tertiary gpf-btn-icon gpf-btn-icon-searchengine fr-btn fr-btn--tertiary";
        button.setAttribute("aria-label", "Rechercher une localisation");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-pressed", false);
        button.setAttribute("type", "button");

        // Close all results and panels when minimizing the widget
        if (button.addEventListener) {
            button.addEventListener("click", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowSearchdialogClick(e);
            });
        } else if (button.attachEvent) {
            button.attachEvent("onclick", function (e) {
                var status = (e.target.ariaPressed === "true");
                e.target.setAttribute("aria-pressed", !status);
                self.onShowSearchdialogClick(e);
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
    _createSearchdialogPanelElement : function () {
        var dialog = document.createElement("dialog");
        dialog.id = this._addUID("GPsearchdialogPanel");
        dialog.className = "GPpanel gpf-panel fr-modal";

        return dialog;
    },

    _createSearchdialogPanelDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__searchdialog fr-modal__body";
        return div;
    },

    _createSearchdialogPanelContentElement : function () {
        var div = document.createElement("div");
        div.id = "searchmodal";
        div.className = "fr-modal__content";
        return div;
    },

    _createSearchdialogPanelTitleDivElement : function () {
        var div = document.createElement("div");
        div.className = "gpf-panel__title__searchdialog fr-modal__title fr-icon-cartosp-searchengine";
        div.innerHTML = " Rechercher une localisation";
        return div;
    },

    /**
     * Create Header Panel
     *
     * @returns {DOMElement} DOM element
     */
    _createSearchdialogPanelHeaderElement : function () {
        var container = document.createElement("div");
        container.className = "gpf-panel__header_searchdialog fr-modal__header";
        return container;
    },
    _createSearchdialogPanelCloseElement : function () {
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
                document.getElementById(self._addUID("GPshowSearchdialogPicto")).click();
            }, false);
        } else if (btnClose.attachEvent) {
            btnClose.attachEvent("onclick", function () {
                document.getElementById(self._addUID("GPshowSearchdialogPicto")).click();
            });
        }

        return btnClose;
    },

};

export default SearchdialogDOM;
