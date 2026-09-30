import test from 'node:test';
import assert from 'node:assert/strict';
import {isBackSwipe} from '../gestures.js';

test('Back gesture requires a clear rightward motion from the sheet edge',()=>{
 assert.equal(isBackSwipe({x:45,y:350},{x:155,y:365}),true);
 assert.equal(isBackSwipe({x:75,y:350},{x:210,y:350}),false);
 assert.equal(isBackSwipe({x:40,y:350},{x:110,y:350}),false);
 assert.equal(isBackSwipe({x:45,y:350},{x:160,y:440}),false);
 assert.equal(isBackSwipe({x:45,y:350},{x:5,y:350}),false);
 assert.equal(isBackSwipe(null,{x:155,y:365}),false);
});
