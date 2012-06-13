GAME.AnimationManager = Em.Object.create({
    _elements: [],
    _lastUpdate: Date.now(),

    addElement: function( element ) {
        this.get('_elements').push( element );
    },

    removeElement: function( element ) {
        var elements = this.get('_elements');
        elements.remove( elements.indexOf( element ) );
    },

    elementCount: function() {
        return this.get('_elements').length;
    }.property('_elements').cacheable(),

    update: function() {
        var timeDiff = (Date.now() - this.get('_lastUpdate') ) / 50;
        this.set('_lastUpdate', Date.now());
        this.get('_elements').forEach(function(element) {
            element.update();
            element.get('mesh').updateAnimation( timeDiff );
        });
    }
});