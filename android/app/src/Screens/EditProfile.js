import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const currentUser = auth().currentUser;
  const navigation=useNavigation()
  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const doc = await firestore().collection('users').doc(currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        setName(data?.name || '');
        setDesignation(data?.designation || '');
        setRole(data?.role || '');
        setImageUrl(data?.imageUrl || '');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    const filename = `${currentUser.uid}_profile.jpg`;
    const ref = storage().ref(`profiles/${filename}`);

    setUploading(true);
    await ref.putFile(uri);
    const url = await ref.getDownloadURL();
    setUploading(false);
    return url;
  };

  const handleImagePick = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) return;

      const asset = response.assets?.[0];
      if (asset?.uri) {
        try {
          const downloadUrl = await uploadImage(asset.uri);
          setImageUrl(downloadUrl);
        } catch (error) {
          Alert.alert('Upload Failed', 'Image upload failed');
        }
      }
    });
  };

  const saveProfile = async () => {
    if (!name || !designation || !role) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }

    try {
      await firestore().collection('users').doc(currentUser.uid).set({
        name,
        designation,
        role,
        imageUrl,
      }, { merge: true });
      Alert.alert('Success', 'Profile saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#000" />;

  return (
    <View style={styles.container}>
     <View style={{ flexDirection: "row", alignItems: "center",marginTop:10 }}>
                    <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
                        <Image
                            style={{ height: 20, width: 20 }}
                            source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}/>
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 90, fontSize: 18 }}>EditProfile</Text>
                </View>
      <View style={{alignItems:'center'}}>
        <TouchableOpacity onPress={handleImagePick}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text>Select Image</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={{alignSelf:'flex-start',fontSize:18}}>Name</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <Text style={{alignSelf:'flex-start',fontSize:18}}>Designation</Text>    
      <TextInput style={styles.input} placeholder="Designation" value={designation} onChangeText={setDesignation} />
      <Text style={{alignSelf:'flex-start',fontSize:18}}>Role</Text>
      <TextInput style={styles.input} placeholder="Role" value={role} onChangeText={setRole} />
      <Button title={uploading ? 'Uploading...' : 'Save Profile'} onPress={saveProfile} disabled={uploading} />
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff'},
  input: { width: '100%', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 10, padding: 10 },
  image: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  placeholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
});
