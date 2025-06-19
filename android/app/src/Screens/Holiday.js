import React, { useEffect, useState } from "react";
import {View,TouchableOpacity,Text,Modal,FlatList, TextInput, Alert} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestrore from '@react-native-firebase/firestore'
import DateTimePicker from "@react-native-community/datetimepicker"
import moment from "moment";

const Holiday=()=>{
    const [hr,setHr]=useState(false)
    const [holidays,setHolidays]=useState([])
    const [startDate,setStartDate]=useState(new Date())
    const [endDate,setEndDate]=useState(new Date())
    const [reason,setReason]=useState('')
    const [editingId,setEditingId]=useState(null)
    const [showStartPicker,setShowStartPicker]=useState(false)
    const [showEndPicker,setShowEndPicker]=useState(false)
    const [modalVisible,setModalVisible]=useState(false)
    const user=auth().currentUser

    useEffect(()=>{
        if(user.email === 'hr1@gmail.com'){
            setHr(true)
        }
        const unsubscribe= firestrore().collection("holidays").orderBy("startDate","desc").onSnapshot((snapshot)=>{
            const data = snapshot.docs.map((doc)=>({
                id : doc.id,
                ...doc.data()
            }))
            setHolidays(data);
        })
        return unsubscribe;
    },[])

    const addHoliday=async ()=>{
        if(!reason.trim()) return Alert.alert("Please enter reason")
        const newHoliday={
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            reason,
            createdAt: firestrore.FieldValue.serverTimestamp()
        } 
        try{
           if (editingId) {
                await firestrore().collection("holidays").doc(editingId).update(newHoliday)
                const doc = await firestrore().collection("holidays").doc(editingId).get()
                const { notificationId } = doc.data()
                if (notificationId) {
                await firestrore().collection("Notifications").doc(notificationId).update({
                     message: `📢 Holiday updated: ${reason} (${moment(startDate).format("MMM D")}) to (${moment(endDate).format("MMM D")})`,
                     timestamp: firestrore.FieldValue.serverTimestamp()
                })
                }
            }
            else {
                const notificationRef = await firestrore().collection("Notifications").add({
                 message: `📢 Holiday announced: ${reason} (${moment(startDate).format("MMM D")}) to (${moment(endDate).format("MMM D")})`,
                 timestamp: firestrore.FieldValue.serverTimestamp()
                })
                await firestrore().collection("holidays").add({
                 ...newHoliday,
                 notificationId: notificationRef.id
                })
            }

            setModalVisible(false)
            setReason("")
            setEditingId(null)
        }catch(error){
            Alert.alert("Error adding Holidays",error.message)
        }
    }

    const deleteHoliday=async (id)=>{
        const doc = await firestrore().collection("holidays").doc(id).get()
        const { notificationId } = doc.data()

        Alert.alert("Confirm Delete","Are you sure you want to delete this?",[
            {text:'Cancel'},
            {text:"Delete",onPress: async()=>{await firestrore().collection("holidays").doc(id).delete()
                await firestrore().collection("Notifications").doc(notificationId).delete()
            }}
        ])
    }

    const openEditModal=(item)=>{
        setStartDate(new Date(item.startDate))
        setEndDate(new Date(item.endDate))
        setReason(item.reason)
        setEditingId(item.id)
        setModalVisible(true)
    }

    return(
        <View>
        <Text style={{margin:20,fontSize:20}}>Holidays</Text>
        {hr && (
        <TouchableOpacity style={{alignItems:'center',justifyContent:'center',backgroundColor:'rgba(8, 131, 180, 1)',margin:20,height:40,width:'90%'}} onPress={()=>{setModalVisible(true);setEditingId(null);setStartDate(new Date());setEndDate(new Date());setReason("")}}>
            <Text style={{color:'white'}}>Add Holiday</Text>
        </TouchableOpacity>)}ِِ
        <FlatList
            data={holidays}
            keyExtractor={(item)=>item.id}
            renderItem={({item})=>{ return(
                <View style={{backgroundColor: "#f0f0f0",marginBottom:15,borderRadius:10,padding:10,borderWidth:1,marginHorizontal:10}}>
                <Text style={{fontSize:16,fontWeight:"bold"}}>Holiday: {item.reason}</Text>
                <Text>{moment(item.startDate).format("MMM D")} - {moment(item.endDate).format("MMM D")}</Text>
                {hr && (
                    <View style={{marginTop:5,gap:10,flexDirection:'row'}}>
                        <TouchableOpacity onPress={()=>openEditModal(item)}>
                            <Text style={{color:'orange'}}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>deleteHoliday(item.id)}>
                            <Text style={{color:'red'}}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
                </View>
            )}}
        />
        <Modal 
         transparent 
         visible={modalVisible} 
         animationType="slide" 
         onRequestClose={()=> setModalVisible(false)}
         >
            <View style={{justifyContent:'flex-end',backgroundColor: 'rgba(0,0,0,0.3)',flex:1}}>
                <View style={{padding:20,height:'60%',backgroundColor:'white',borderTopRightRadius:20,borderTopLeftRadius:20}}>
                    <Text style={{textAlign:'center',fontSize:20}}>{editingId ? "Edit Holiday" : "Add a Holiday"}</Text>
                    <Text>Start Date</Text>
                    <TouchableOpacity style={{borderWidth:1,padding:10,borderRadius:8,marginBottom:10}} onPress={()=>setShowStartPicker(true)}>
                        <Text>{moment(startDate).format("YYYY-MM-DD")}</Text>
                    </TouchableOpacity>
                    <Text>End Date</Text>
                    <TouchableOpacity style={{borderWidth:1,padding:10,borderRadius:8,marginBottom:10}} onPress={()=>setShowEndPicker(true)}>
                        <Text>{moment(endDate).format("YYYY-MM-DD")}</Text>
                    </TouchableOpacity>
                    <Text>Reason</Text>
                    <TextInput 
                        value={reason} 
                        onChangeText={setReason} 
                        placeholder="e.g Eid holidays" 
                        style={{borderWidth:1,padding:10,borderRadius:8,marginBottom:10}}/>
                    <TouchableOpacity style={{backgroundColor:'blue',alignItems:'center',padding:12,borderRadius:10}} onPress={addHoliday}>
                        <Text style={{color:'white',fontWeight:"bold"}}>{editingId ? "Update Holiday" : "Save Holiday"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{backgroundColor:'red',alignItems:'center',padding:12,borderRadius:10}} onPress={()=>{setModalVisible(false);setEditingId(null)}}>
                        <Text style={{color:'white',fontWeight:"bold"}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        {showStartPicker && (
            <DateTimePicker
             value={startDate}
             mode="date"
             display="default" 
             onChange={(event,selectedDate)=>{
                setShowStartPicker(false);
                if(selectedDate) setStartDate(selectedDate)}}
            />
        )}
        {showEndPicker && (
            <DateTimePicker 
             value={endDate} 
             mode="date" 
             display="default" 
             onChange={(event,selectedDate)=>{
                setShowEndPicker(false);
                if(selectedDate) setEndDate(selectedDate)}}
            />
        )}
        </View>
    )
}

export default Holiday;
