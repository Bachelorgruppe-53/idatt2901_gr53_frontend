import React, { useState } from 'react';
import { Modal, View, Text, Button, StyleSheet, Pressable, TextInput } from 'react-native';

interface JoinClassModalProps {
  onClose: () => void;
}

const JoinClassModal = ({ onClose }: JoinClassModalProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Bli med i en klasse</Text>
          <Text style={styles.subText}>Skriv inn klassekoden din her:</Text>
          <TextInput
            style={styles.input}
            placeholder="Klassekode"
          />
          <Button title="Lukk" onPress={onClose} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adds a backdrop overlay
    width: '100%',
    height: '100%',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 200,
    borderRadius: 8
  },
});

export default JoinClassModal;