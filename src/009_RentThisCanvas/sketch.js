export default (p) => {
  var canvas;

  var fillColor = { r: 96, g: 125, b: 139 };
  var brushSize = 10;
  var locked = true;
  var startingImg = null;

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
      console.log('props', props);
      fillColor = props.color;
      brushSize = props.brushSize;
      locked = props.locked;
      if (props.startingImg !== startingImg) {
          p.loadImage(props.startingImg, (img) => p.background(img));
          startingImg = props.startingImg;
      }
  };

    p.setup = () => {
        canvas = p.createCanvas(600, 400);
        canvas.elt.id = 'sketch';
    };

    p.draw = () => {
        if (locked) return;
        p.noStroke();
        p.fill(fillColor.r, fillColor.g, fillColor.b);
        if (p.mouseIsPressed) {
            p.ellipse(
                p.mouseX,
                p.mouseY,
                parseInt(brushSize)
            );
        }
    };
};