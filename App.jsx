import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal, TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Create, Update, GetAll, Delete } from './api';
import ToggleSwitch from 'toggle-switch-react-native';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message'

const MoneyTracker = () => {
  const [spendings, setSpendings] = useState([]);
  const [newSpending, setNewSpending] = useState({ value: '', date: new Date(), name: '', type: 'debit' });
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState(0)
  const [todayspent, setTodayspent] = useState(0)
  const [fetch, setFetch] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [editSpending, setEditSpending] = useState(null);

  useEffect(() => {
    GetAll().then((res) => {
      if (res.status) {
        setSpendings(res.data.sort((a,b) => b.id - a.id));
        getBalance(res.data);
        getTodaysspent(res.data);
      } else {
        setSpendings([]);
      }
    });
  }, [fetch]);

  const getBalance = (data) => {
    const addlist = data.filter((it) => it.type === 'credit').map((item) => parseInt(item.value));
    const sublist = data.filter((it) => it.type === 'debit').map((item) => parseInt(item.value));

    const totalCredits = addlist.reduce((acc, curr) => acc + curr, 0);
    const totalDebits = sublist.reduce((acc, curr) => acc + curr, 0);

    const balance = totalCredits - totalDebits;

    setBalance(balance);
  }

  const getTodaysspent = (data) => {
    const sublist = data.filter((it) => it.type === 'debit' && dayjs(it.date).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY')).map((item) => parseInt(item.value));

    setTodayspent(sublist);
  }


  const handleEditSpending = () => {
    Update(editSpending.id, editSpending).then((res) => {
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Your record is updated!!'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res.msg
        });
      }
      setFetch((prev) => !prev)
    });
    setModalVisibleEdit(false);
  };


  const renderItem = ({ item }) => {
    const handleDelete = () => {
      Delete(item.id).then((res) => {
        if (res.status) {
          Toast.show({
            type: 'success',
            text1: 'Your record deleted successfully!!'
          });
        } else {
          Toast.show({
            type: 'error',
            text1: res.msg
          });
        }
        setFetch((prev) => !prev)
      });
    };
    return (
      <View style={styles.listItem}>
        <View>
          <Text style={styles.listname}>{item.name}</Text>
          <Text style={styles.listDate}>{dayjs(item.date).format('DD MMM YY')}</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Text style={{ ...styles.listvalue, color: item.type === 'credit' ? '#28a745' : '#ef4444' }}>₹{Number(item.value).toLocaleString('en')}</Text>
          <TouchableOpacity
            style={styles.listbuttonedit}
            onPress={() => {
              setEditSpending(item);
              setModalVisibleEdit(true);
            }}
          >
            <MaterialIcons name="edit" size={20} color="#5eead4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listbuttonedit}
            onPress={() => {
              handleDelete();
            }}
          >
            <MaterialIcons name="delete" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleAddSpending = () => {
    Create(newSpending).then((res) => {
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Record created successfully!!'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res.msg
        });
      }
      setFetch((prev) => !prev)
    });
    setNewSpending({ value: '', date: new Date(), name: '', type: 'debit' });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{dayjs().format('DD MMMM YYYY')}</Text>
      </View>
      <View style={styles.main}>
        <Image source={require('./asset/moneybag1.png')} style={styles.icon} />
        <View>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balance}>₹{Number(balance).toLocaleString('en')}</Text>
          <Text style={styles.spendingLabel}>Today's Spendings</Text>
          <Text style={styles.spending}>₹{Number(todayspent).toLocaleString('en')}</Text>
        </View>
      </View>
      <FlatList
        data={spendings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListHeaderComponent={<Text style={styles.listHeader}>Spendings List</Text>}
      />
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={30} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardLabel}>Add your spendings</Text>
            <ToggleSwitch
              isOn={newSpending.type === 'credit'}
              onColor="green"
              offColor="red"
              label={newSpending.type}
              labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
              size="medium"
              onToggle={isOn => {
                setNewSpending({ ...newSpending, type: isOn ? 'credit' : 'debit' });
              }}
            />
            <View style={styles.modalComp}>
              <Text style={styles.modalCardLabelSmall}>Name</Text>
              <TextInput
                style={styles.input}
                value={newSpending.name}
                onChangeText={text => setNewSpending({ ...newSpending, name: text })}
              />
            </View>
            <View style={styles.modalComp}>
              <Text style={styles.modalCardLabelSmall}>Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newSpending.value}
                onChangeText={text => setNewSpending({ ...newSpending, value: text })}
              />
            </View>
            <View style={styles.modalComp}>
              <Text style={styles.modalCardLabelSmall}>Date</Text>
              <DatePicker
                date={newSpending.date}
                onDateChange={date => setNewSpending({ ...newSpending, date: date })}
                mode="date"
                style={styles.datePicker}
                textColor="#eee"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddSpending}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleEdit}
        onRequestClose={() => setModalVisibleEdit(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalCard}>
            <Text style={styles.modalCardLabel}>Edit your spendings</Text>
            {editSpending && (
              <>
                <ToggleSwitch
                  isOn={editSpending.type === 'credit'}
                  onColor="green"
                  offColor="red"
                  label={editSpending.type}
                  labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
                  size="medium"
                  onToggle={isOn => {
                    setEditSpending({ ...editSpending, type: isOn ? 'credit' : 'debit' });
                  }}
                />
                <View style={styles.modalComp}>
                  <Text style={styles.modalCardLabelSmall}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editSpending.name}
                    onChangeText={text => setEditSpending({ ...editSpending, name: text })}
                  />
                </View>
                <View style={styles.modalComp}>
                  <Text style={styles.modalCardLabelSmall}>Amount</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={editSpending.value}
                    onChangeText={text => setEditSpending({ ...editSpending, value: text })}
                  />
                </View>
                <View style={styles.modalComp}>
                  <Text style={styles.modalCardLabelSmall}>Date</Text>
                  <DatePicker
                    date={new Date(editSpending.date)}
                    onDateChange={date => setEditSpending({ ...editSpending, date: date })}
                    mode="date"
                    style={styles.datePicker}
                    textColor="#eee"
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleEditSpending}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisibleEdit(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Toast
        position='top'
        topOffset={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#042f2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 24,
    color: '#ccfbf1',
    fontFamily: 'Montserrat-Bold'
  },
  main: {
    alignItems: 'center',
    backgroundColor: '#115e59',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    width: '95%',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#ccfbf1',
    fontFamily: 'Montserrat-Regular'
  },
  balance: {
    fontSize: 24,
    color: '#28a745',
    marginVertical: 0,
    fontFamily: 'Montserrat-Bold'
  },
  spendingLabel: {
    fontSize: 16,
    color: '#ccfbf1',
    marginTop: 20,
    fontFamily: 'Montserrat-Regular'
  },
  spending: {
    fontSize: 24,
    color: '#ef4444',
    marginVertical: 0,
    fontFamily: 'Montserrat-Bold'
  },
  list: {
    width: '100%',
  },
  listHeader: {
    fontSize: 20,
    color: '#ccfbf1',
    marginBottom: 10,
    alignSelf: 'center',
    fontFamily: 'Montserrat-Bold'
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
    borderColor: '#134e4a',
    borderWidth: 1
  },
  listDate: {
    fontSize: 14,
    color: '#14b8a6',
    fontFamily: 'Montserrat-Regular'
  },
  listvalue: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold'
  },
  listname: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 18,
    color: '#f0fdfa',
  },
  listbuttonedit: {
    borderRadius: 50,
    alignItems: 'center',
    width: 30,
    height: 30,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#0d9488',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    width: 70,
    height: 70,
    justifyContent: 'center',
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#134e4a',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: 10,
    padding: 20,
  },
  modalCardLabel: {
    fontSize: 20,
    color: '#ccfbf1',
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Montserrat-Bold',
  },
  modalCardLabelSmall: {
    fontSize: 16,
    color: '#ccfbf1',
    marginLeft: 10,
    fontFamily: 'Montserrat-Medium',
  },
  modalComp: {
    margin: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(225,225,225,0.3)',
    borderRadius: 10,
    borderColor: 'rgba(225,225,225,0.3)',
    borderWidth: 1,
    color: 'white',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold'
  },
  datePicker: {
    width: 270,
    borderRadius: 5,
    padding: 10
  },
  modalButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
});

export default MoneyTracker;
