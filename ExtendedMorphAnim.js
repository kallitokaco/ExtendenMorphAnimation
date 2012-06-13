
ExtendedMorphAnim = function ( mesh ) {

	this.mesh=mesh;
	// API

	this.duration = 1000; // milliseconds
	this.mirroredLoop = false;
	this.time = 0;

	// internals

	this.lastKeyframe = 0;
	this.currentKeyframe = 0;

	this.direction = 1;
	this.directionBackwards = false;

	this.setFrameRange( 0, 0 );
	this.__playOnce=false;
        this.__callbackIfAnimationStopps=undefined;
        this.__currentAnimation='';

};

//ExtendedMorphAnim.prototype = new THREE.Mesh();
ExtendedMorphAnim.prototype.constructor = ExtendedMorphAnim;

ExtendedMorphAnim.prototype.setFrameRange = function ( start, end ) {

	this.startKeyframe = start;
	this.endKeyframe = end;

	this.length = this.endKeyframe - this.startKeyframe + 1;

};

ExtendedMorphAnim.prototype.setDirectionForward = function () {

	this.direction = 1;
	this.directionBackwards = false;

};

ExtendedMorphAnim.prototype.setDirectionBackward = function () {

	this.direction = -1;
	this.directionBackwards = true;

};


ExtendedMorphAnim.prototype.playAnimation = function ( label, fps ) {

	var animation = this.mesh.geometry.animations[ label ];

        this.__callbackIfAnimationStopps=undefined;
	if ( animation ) {
                this.__currentAnimation=label;
		this.setFrameRange( animation.start, animation.end );
		this.duration = 1000 * ( ( animation.end - animation.start ) / fps );
		this.time = 0;
		this.speed=1.0;
		//console.log("Animation:" + label + " gestartet");
	} else {

		console.warn( "animation[" + label + "] undefined" );

	}
    return this;
};

ExtendedMorphAnim.prototype.getCurrentAnimationLabel = function ( ) {

	return this.__currentAnimation;
};
ExtendedMorphAnim.prototype.__AnimationEnd = function ( ) {
	//console.log("Animation:" + this.__currentAnimation + " entfernt");
	this.endKeyframe=this.startKeyframe;
	this.__playOnce=false;
	if(this.__callbackIfAnimationStopps != undefined && typeof this.__callbackIfAnimationStopps == 'function') this.__callbackIfAnimationStopps();
	this.__callbackIfAnimationStopps=undefined;
	this.__currentAnimation='';
	this.mesh.morphTargetInfluences[ this.lastKeyframe ] = 0;
	this.mesh.morphTargetInfluences[ this.currentKeyframe ] = 0;
	this.mesh.removeCurrentAnimation(this);
};

ExtendedMorphAnim.prototype.updateAnimation = function ( delta ) {

	if(this.startKeyframe==this.endKeyframe) return;//animierung stoppen
	var frameTime = this.duration / this.length;

	this.time += this.direction * delta * this.speed;

	if ( this.mirroredLoop ) {

		if ( this.time > this.duration || this.time < 0 ) {

			this.direction *= -1;

			if ( this.time > this.duration ) {

				this.time = this.duration;
				this.directionBackwards = true;

			}

			if ( this.time < 0 ) {

				this.time = 0;
				this.directionBackwards = false;
                                if(this.__playOnce)
                                {
                                    this.__AnimationEnd();
				    return;
                                }
			}

		}

	} else {
                if(this.__playOnce && this.time >= this.duration)
                {
			this.__AnimationEnd();
			return;
                }
		this.time = this.time % this.duration;

		if ( this.time < 0 )
		{
		    this.time += this.duration;

		}

	}

	var keyframe = this.startKeyframe + THREE.Math.clamp( Math.floor( this.time / frameTime ), 0, this.length - 1 );

	if ( keyframe !== this.currentKeyframe ) {

		this.mesh.morphTargetInfluences[ this.lastKeyframe ] = 0;
		this.mesh.morphTargetInfluences[ this.currentKeyframe ] = 1;

		this.mesh.morphTargetInfluences[ keyframe ] = 0;

		this.lastKeyframe = this.currentKeyframe;
		this.currentKeyframe = keyframe;

	}

	var mix = ( this.time % frameTime ) / frameTime;

	if ( this.directionBackwards ) {

		mix = 1 - mix;

	}

	this.mesh.morphTargetInfluences[ this.currentKeyframe ] = mix;
	this.mesh.morphTargetInfluences[ this.lastKeyframe ] = (1 - mix);

};


ExtendedMorphAnim.prototype.playAnimationOnce = function ( label, fps ) {

	this.playAnimation(label,fps);
        this.__playOnce=true;
        return this;
};
ExtendedMorphAnim.prototype.playAnimationOnce = function ( label, fps, callbackIfAnimationStopps ) {

	this.playAnimation(label,fps);
        this.__playOnce=true;
        this.__callbackIfAnimationStopps=callbackIfAnimationStopps;
        return this;
};
ExtendedMorphAnim.prototype.speedUp = function (  faktor ) {
	if(faktor<0)
	{
		console.log("ExtendedMorphAnim.prototype.speedUp no negative faktor allowed!");
		return this;
	}
	this.speed *= faktor;
	return this;
};
ExtendedMorphAnim.prototype.setSpeed = function (  speed ) {
	if(speed<0)
	{
		console.log("ExtendedMorphAnim.prototype.setSpeed no negative faktor allowed!");
		return this;
	}
	this.speed = speed;
	return this;
};
ExtendedMorphAnim.prototype.stopAnimationNextCycle = function () {
	this.__playOnce=true;
};
ExtendedMorphAnim.prototype.stopAnimationNextCycle = function (callbackIfAnimationStopps) {
	this.__playOnce=true;
	this.__callbackIfAnimationStopps=callbackIfAnimationStopps;
};
ExtendedMorphAnim.prototype.resumeAnimationNextCycle = function () {
	this.__playOnce=false;
	this.__callbackIfAnimationStopps=undefined;
};
ExtendedMorphAnim.prototype.getAnimationSpeed = function () {
	return this.speed;
};
ExtendedMorphAnim.prototype.deleteAnimation = function ()
{
	this.__AnimationEnd();
	/*this.mesh.morphTargetInfluences[ this.lastKeyframe ] = 0;
	this.mesh.morphTargetInfluences[ this.currentKeyframe ] = 0;
	this.mesh.removeCurrentAnimation(this);*/
}
