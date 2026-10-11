/** Accessibility motion policy. Reduced motion removes decorative movement, never gameplay time. */
Homeward.define('engine/motion-policy', [], () => {
  function actionDuration(milliseconds){
    if(!Number.isFinite(milliseconds)||milliseconds<=0)throw new TypeError('Invalid action duration');
    return milliseconds;
  }
  function dialogueDelay(milliseconds){
    if(!Number.isFinite(milliseconds)||milliseconds<0)throw new TypeError('Invalid dialogue delay');
    return milliseconds;
  }
  function sceneTransition(reduced){return reduced?260:480;}
  return {actionDuration,dialogueDelay,sceneTransition};
});
