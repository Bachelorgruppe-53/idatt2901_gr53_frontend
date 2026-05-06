const React = require("react");
const { Text } = require("react-native");

function MockIcon(props) {
  return React.createElement(Text, props, props.name || "icon");
}

MockIcon.glyphMap = {};

const mockExports = {
  MaterialIcons: MockIcon,
  default: MockIcon,
};

module.exports = new Proxy(mockExports, {
  get(target, property) {
    if (property in target) {
      return target[property];
    }

    return MockIcon;
  },
});
