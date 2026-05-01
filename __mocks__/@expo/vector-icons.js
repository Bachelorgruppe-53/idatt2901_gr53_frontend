const React = require("react");
const { Text } = require("react-native");

function MockIcon(props) {
  return React.createElement(Text, props, props.name || "icon");
}

module.exports = {
  MaterialIcons: MockIcon,
};
