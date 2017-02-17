import React from 'react';
import styles from './App.css';
import TreeMap from './TreeMap';
import d3 from 'd3';
import myData from '../data/data.json';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {test: 'foo'};
  }

  componentWillMount() {

  }
  
  render() {
    console.log(myData);
    return (
      <div>
        <TreeMap data={myData[0]}/>
      </div>
    );
  }
}
