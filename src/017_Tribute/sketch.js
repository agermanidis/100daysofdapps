export default p => {
  var canvas;
  var mood = 0.5;

  p.myCustomRedrawAccordingToNewPropsHandler = props => {
      mood = props.mood;
  };

  p.setup = () => {
    canvas = p.createCanvas(300, 300);
    canvas.elt.id = "sketch";
  };

  p.draw = () => {
    p.background(255);
    p.noFill();
    p.ellipse(100, 125, 50);
    p.ellipse(200, 125, 50);
    if (mood > 0.5) {
        p.arc(150, 200, 80, 80 * (mood - 0.5) / 0.5, 0, p.PI);
    } else if (mood === 0.5) {
        p.line(100, 200, 200, 200);
    } else {
        p.arc(150, 200, 80, 80 * (mood - 0.5) / 0.5, p.PI, 0);
    }
  };
};