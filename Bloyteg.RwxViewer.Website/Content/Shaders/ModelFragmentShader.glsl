﻿// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

precision mediump float;
       
uniform vec4 u_baseColor;
uniform float u_opacity;
uniform sampler2D u_textureSampler;
uniform sampler2D u_maskSampler;

uniform bool u_hasTexture;
uniform bool u_hasMask;

varying vec2 v_textureCoordinates;
varying float v_lightWeighting;
	    
void main(void) {
	float alpha = 1.0;

	if(u_hasMask) {
		vec4 sampledMask = texture2D(u_maskSampler, vec2(v_textureCoordinates.s, v_textureCoordinates.t));

		if(sampledMask.r < 0.2) {
			discard;
		}

		alpha = sampledMask.r;
	}

	if(u_hasTexture) {
		vec4 sampledColor = texture2D(u_textureSampler, vec2(v_textureCoordinates.s, v_textureCoordinates.t));
	    gl_FragColor = vec4(sampledColor.rgb * v_lightWeighting, sampledColor.a * alpha * u_opacity);
	} 
	else {
		gl_FragColor = vec4(u_baseColor.rgb * v_lightWeighting, u_baseColor.a * u_opacity);
	}
}