(function() {
    'use strict';

    angular.module('metro.models').factory('Shapes', Shapes);

    Shapes.$inject = ['Database'];

    function Shapes() {

        var shapes = {};

        function getShape(tripId) {
            return shapes[tripId];
        }
        
        function saveShape(tripId, shape) {
            shapes[tripId] = shape;
            return shape;
        }

        return {
            getShape: getShape,
            saveShape: saveShape
        };
    }

})();