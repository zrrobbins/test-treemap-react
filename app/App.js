import React from 'react';
import styles from './App.css';
import TreeMap from './TreeMap';
import d3 from 'd3';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {test: 'foo'};
  }

  componentWillMount() {

  }
  
  render() {
    d3.json("../data/data.json", function(err, res) {
      if (!err) {
        console.log(res);
        var data = res;
        main({title: "Vulnerability"}, {key: "Vulnerabilities", values: data});
      } else {
        console.log(err);
      }
    });
    return (
      <div>
        {/*<TreeMap />*/}
      </div>
    );
  }
}
