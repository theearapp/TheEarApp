/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  ImageBackground,
  Button,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const App: () => React$Node = () => {
  return (
    <>
     <ImageBackground style={{width: '100%', height: '100%'}} source={require("background.jpeg")}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.sectionContainer}>
           <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.sectionTitle}>The Ear</Text>
      </View>
          <View style={styles.sectionContainer}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={styles.sectionDescription}>
            <Button
            title="Motion Alerts"
            color="black"
          />
            </View>
            <View style={styles.sectionDescription}>
              <Button
            title="Speech to Text Translation"
            color="black"
          />
            </View>
            <View style={styles.sectionDescription}>
              <Button
            title="Settings"
            color="black"
          />
            </View>
            <View style={styles.sectionDescription}>
              <Button
            title="Help"
            color="black"
          />
            </View>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({

  engine: {
    position: 'absolute',
    right: 0,
  },
  sectionContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 55,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginTop: 16,
  },
  sectionDescription: {
    marginTop: 16,
    fontSize: 50,
    padding: 30,
    height: 85,
    fontWeight: '400',
    width: "90%",
    margin: 10,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'center',
  },
});

export default App;
