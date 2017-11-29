(function() {
    'use strict';

    // modified from this gist: https://gist.github.com/comp615/2288108
    L.ImgTextIcon = L.Icon.extend({
        options: {
            iconUrl: '',
            text: '',
            shadowUrl: null,
            divSize: new L.Point(20, 41),
            iconSize: new L.Point(20, 41),
            iconAnchor: new L.Point(13, 41),
            className: 'leaflet-div-icon',
            extraClass: null,
            iconClass: null,
            textCLass: null
        },

        createIcon: function() {
            var size = L.point(this.options.iconSize),
                div = document.createElement('div'),
                iconDiv = document.createElement('div'),
                textDiv = document.createElement('div');

            this.options.iconSize = this.options.divSize;

            if (this.options.extraClass) {
                this.options.className = this.options.className + ' ' + this.options.extraClass;
            }

            iconDiv.setAttribute('class', this.options.iconClass || 'icon');
            textDiv.setAttribute('class', this.options.textClass || 'text');

            textDiv.style.lineHeight = size.x + 'px';
            iconDiv.style.lineHeight = size.x + 'px';
            textDiv.innerHTML = this.options.text || '';

            div.appendChild(iconDiv);
            div.appendChild(textDiv);

            this._setIconStyles(div, 'icon');

            return div;
        },

        //you could change this to add a shadow like in the normal marker if you really wanted
        createShadow: function() {
            return null;
        }
    });

})();