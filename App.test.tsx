import React from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
} from 'react-native';

const TestApp = (): JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Hello YB Bingo!</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TestApp;