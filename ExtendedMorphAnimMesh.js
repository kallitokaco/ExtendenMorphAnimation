/**
 * @author alteredq / http://alteredqualia.com/
 */

ExtendedMorphAnimMesh = function ( geometry, material ) {
	THREE.Mesh.call( this, geometry, material );

        this.__currentAnimations=[];
	this.__state={};

};

ExtendedMorphAnimMesh.prototype = new THREE.Mesh();
ExtendedMorphAnimMesh.prototype.constructor = ExtendedMorphAnimMesh;



ExtendedMorphAnimMesh.prototype.init = function (geometry, material){
	THREE.Mesh.call( this, geometry, material );

        this.__currentAnimations=[];
}

ExtendedMorphAnimMesh.prototype.stopAllAnimations = function(params) {
    params = params || {except: []};

    var self =this;
    this.__currentAnimations.forEach(function(animation, i) {
        if (params.except.indexOf(animation.getCurrentAnimationLabel()) == -1) {
            animation.deleteAnimation();
            self.__currentAnimations.remove(i);
        }
    });

    //this.__afterAnimationRemove();
};

ExtendedMorphAnimMesh.prototype.parseAnimations = function () {

	var geometry = this.geometry;

	if ( ! geometry.animations ) geometry.animations = {};

	var firstAnimation, animations = geometry.animations;

	var pattern = /([a-z]+)(\d+)/;

	for ( var i = 0, il = geometry.morphTargets.length; i < il; i ++ ) {

		var morph = geometry.morphTargets[ i ];
		var parts = morph.name.match( pattern );

		if ( parts && parts.length > 1 ) {

			var label = parts[ 1 ];
			var num = parts[ 2 ];

			if ( ! animations[ label ] ) animations[ label ] = { start: Infinity, end: -Infinity };

			var animation = animations[ label ];

			if ( i < animation.start ) animation.start = i;
			if ( i > animation.end ) animation.end = i;

			if ( ! firstAnimation ) firstAnimation = label;

		}

	}

	geometry.firstAnimation = firstAnimation;

};

ExtendedMorphAnimMesh.prototype.setAnimationLabel = function ( label, start, end ) {

	if ( ! this.geometry.animations ) this.geometry.animations = {};

	this.geometry.animations[ label ] = { start: start, end: end };

};
ExtendedMorphAnimMesh.prototype.setState = function ( state ) {
	this.__state=state;
};
ExtendedMorphAnimMesh.prototype.getState = function ( ) {
	return this.__state;
};
ExtendedMorphAnimMesh.prototype.playAnimation = function ( label, fps ) {

	this.__currentAnimations.push(new ExtendedMorphAnim(this).playAnimation(label,fps));
};

ExtendedMorphAnimMesh.prototype.getCurrentAnimations = function ( ) {

	return this.__currentAnimations;

};
ExtendedMorphAnimMesh.prototype.hasCurrentAnimation = function ( label ) {

	for(var i=0;i<this.__currentAnimations.length;i++)
        {
            if(this.__currentAnimations[i].getCurrentAnimationLabel() == label)
		return true;
        }
	return false;

};
ExtendedMorphAnimMesh.prototype.getCurrentAnimation = function ( label ) {

	for(var i=0;i<this.__currentAnimations.length;i++)
        {
            if(this.__currentAnimations[i].getCurrentAnimationLabel() == label)
		return this.__currentAnimations[i];
        }
	return null;

};

ExtendedMorphAnimMesh.prototype.stopCurrentAnimation = function ( label ) {

	for(var i=0;i<this.__currentAnimations.length;i++)
        {
            if(this.__currentAnimations[i].getCurrentAnimationLabel() == label)
	    {
		this.__currentAnimations[i].deleteAnimation();
		this.__currentAnimations.remove(i);
	    }
        }
	this.__afterAnimationRemove();

};
ExtendedMorphAnimMesh.prototype.removeCurrentAnimation = function ( ani ) {

	for(var i=0;i<this.__currentAnimations.length;i++)
        {
            if(this.__currentAnimations[i] == ani)
	    {
		this.__currentAnimations.remove(i);
	    }
        }
    this.__afterAnimationRemove();
};
ExtendedMorphAnimMesh.prototype.__afterAnimationRemove = function () {
    if(this.__currentAnimations.length==0 && this.geometry.animations["default"]!= undefined)
    {
	//d_log("Player default fallback");
	//this.morphTargetInfluences[ this.geometry.animations["default"].start ] = 1;
    }
}
ExtendedMorphAnimMesh.prototype.updateAnimation = function ( delta ) {
    for(var i=0;i<this.__currentAnimations.length;i++)
    {
	this.__currentAnimations[i].updateAnimation(delta);
    }
};

ExtendedMorphAnimMesh.prototype.playAnimationIfNotRunning = function ( label, fps, speed ) {
    var animation = this.getCurrentAnimation(label);
    if(animation== undefined)
    {
	this.playAnimation(label,fps);
	animation = this.getCurrentAnimation(label);
	animation.setSpeed(speed);
    }
    else{
	
	animation.setSpeed(speed); //den l�schvorgang abbrechen, wenn die animation doch noch gebraucht wird
	animation.resumeAnimationNextCycle();
    }
};
ExtendedMorphAnimMesh.prototype.playAnimationOnce = function ( label, fps ) {

	this.__currentAnimations.push(new ExtendedMorphAnim(this).playAnimationOnce(label,fps));
};
ExtendedMorphAnimMesh.prototype.playAnimationOnce = function ( label, fps, callbackIfAnimationStopps ) {

	this.__currentAnimations.push(new ExtendedMorphAnim(this).playAnimationOnce(label,fps,callbackIfAnimationStopps));
};


