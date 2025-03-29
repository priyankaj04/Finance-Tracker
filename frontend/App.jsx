import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, FlatList, Modal, TextInput, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import DatePicker from 'react-native-date-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Create, Update, GetAll, Delete } from './api';
import ToggleSwitch from 'toggle-switch-react-native';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import background from './asset/background.png';
import profileimg from './asset/profileimg.png';
import SelectDropdown from 'react-native-select-dropdown'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const MoneyTracker = () => {
  const [spendings, setSpendings] = useState([]);
  const [newSpending, setNewSpending] = useState({ value: '', date: new Date(), name: '', type: 'debit', spendingtype: '', paymenttype: 'paid' });
  const [modalVisible, setModalVisible] = useState(false);
  const [balance, setBalance] = useState(0);
  const [todayspent, setTodayspent] = useState(0);
  const [fetch, setFetch] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [editSpending, setEditSpending] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const Options = ['Food', 'Travel', 'Coffee', 'Haarvish', 'Brunda', 'Simpl', 'Chats', 'Petrol', 'EMI', 'Bank', 'Income', 'Others'];

  const getAllList = async () => {
    try{
    const response = await GetAll();
    if (response?.status) {
      setSpendings(response.data.sort((a, b) => b.id - a.id));
      getBalance(response.data);
      getTodaysspent(response.data);
      getBorrowingsList(response.data)
      setLoading(false)
    } else {
      setSpendings([]);
      setLoading(false);
    }
  } catch (error) {
    console.log("Error here only", error)
    setSpendings([]);
    setLoading(false);
  }
  }

  useEffect(() => {
    getAllList()
  }, [fetch]);


  const getFormattedDate = (inputDate) => {
    const date = dayjs(inputDate);
    const today = dayjs();
    const startOfWeek = today.startOf('week');
    const endOfWeek = today.endOf('week');

    if (date.isToday()) {
      return 'Today';
    } else if (date.isYesterday()) {
      return 'Yesterday';
    } else if (date.isSameOrAfter(startOfWeek) && date.isSameOrBefore(endOfWeek)) {
      return date.format('dddd');
    } else {
      return date.format('MMMM D, YYYY');
    }
  };

  const getBorrowingsList = (data) => {
    const borrowinglist = data.filter((it) => it.paymenttype === 'borrowed' && dayjs(it.date).format('MM-YYYY') === dayjs().format('MM-YYYY'));

    const finallist = [];

    borrowinglist?.forEach((item) => {
      let getotherlists = []
      if (item.spendingtype === 'Others') {
        getotherlists = data.filter((it) => it.name == item.name && item.spendingtype === 'Others' && it.value === item.value && it.paymenttype === 'paid' && dayjs(it.date).format('MM-YYYY') === dayjs().format('MM-YYYY'));
        console.log("getotehr", getotherlists)
      } else {
        getotherlists = data.filter((it) => it.spendingtype === item.spendingtype && it.value === item.value && it.paymenttype === 'paid' && dayjs(it.date).format('MM-YYYY') === dayjs().format('MM-YYYY'))
      }

      if (getotherlists?.length > 0) {
        finallist.push({ ...item, status: 'paid' })
      } else {
        finallist.push({ ...item, status: 'notpaid' })
      }
    })

    setBorrowings(finallist);
  }

  const getBalance = (data) => {
    const addlist = data.filter((it) => it.type === 'credit').map((item) => parseInt(item.value));
    const sublist = data.filter((it) => it.type === 'debit').map((item) => parseInt(item.value));

    const totalCredits = addlist.reduce((acc, curr) => acc + curr, 0);
    const totalDebits = sublist.reduce((acc, curr) => acc + curr, 0);

    const balance = totalCredits - totalDebits;

    setBalance(balance);
  };

  const getTodaysspent = (data) => {
    const sublist = data.filter((it) => it.type === 'debit' && dayjs(it.date).format('DD-MM-YYYY') === dayjs().format('DD-MM-YYYY')).map((item) => parseInt(item.value));

    setTodayspent(sublist.reduce((acc, curr) => acc + curr, 0));
  };

  const handleEditSpending = () => {
    Update(editSpending.id, editSpending).then((res) => {
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Your record is updated!!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res.msg,
        });
      }
      setFetch((prev) => !prev);
    });
    setModalVisibleEdit(false);
  };

  const handleDelete = () => {
    Delete(editSpending.id).then((res) => {
      setModalVisibleEdit(false);
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Your record deleted successfully!!',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: res.msg,
        });
      }
      setFetch((prev) => !prev);
    });
  };

  const renderItem = ({ item }) => {
    const GetIconWithType = ({ type }) => {
      if (type === 'Income') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#4ade80" }}>
            <FontAwesome name="rupee" size={22} color="black" />
          </View>
        )
      } else if (type === 'Travel') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#a78bfa" }}>
            <FontAwesome name="car" size={22} color="black" />
          </View>
        )
      } else if (type === 'Food') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#2dd4bf" }}>
            <Ionicons name="fast-food" size={22} color="black" />
          </View>
        )
      } else if (type === 'Coffee') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#fbbf24" }}>
            <MaterialIcons name="coffee" size={22} color="black" />
          </View>
        )
      } else if (type === 'Haarvish') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#fb7185" }}>
            <AntDesign name="heart" size={22} color="black" />
          </View>
        )
      } else if (type === 'Brunda') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#e879f9" }}>
            <FontAwesome6 name="handshake-simple" size={22} color="black" />
          </View>
        )
      } else if (type === 'Simpl') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#22d3ee" }}>
            <FontAwesome5 name="credit-card" size={22} color="black" />
          </View>
        )
      } else if (type === 'Chats') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#a3e635" }}>
            <Icon name="food-fork-drink" size={22} color="black" />
          </View>
        )
      } else if (type === 'Petrol') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#facc15" }}>
            <Icon name="scooter" size={22} color="black" />
          </View>
        )
      } else if (type === 'EMI') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#2dd4bf" }}>
            <MaterialIcons name="payments" size={22} color="black" />
          </View>
        )
      } else if (type === 'Bank') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#34d399" }}>
            <Icon name="bank" size={22} color="black" />
          </View>
        )
      } else if (type === 'Others') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#818cf8" }}>
            <FontAwesome name="money" size={22} color="black" />
          </View>
        )
      }
    }

    return (
      <TouchableOpacity
        onPress={() => {
          setEditSpending(item);
          setModalVisibleEdit(true);
        }}
        style={styles.listItem}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 15, alignItems: 'center' }}>
          <GetIconWithType type={item.spendingtype} />
          <View>
            <Text style={styles.listDate}>{getFormattedDate(item.date)}</Text>
            <Text style={styles.listname}>{item.name}</Text>
          </View>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Text style={{ ...styles.listvalue, color: item.type === 'credit' ? '#28a745' : 'white', alignItems: 'center', alignSelf: 'center' }}>
            {
              item.type === 'credit' ?
                <Feather name="arrow-down-left" size={24} color="green" /> :
                <Feather name="arrow-up-right" size={24} color="red" />
            }
            ₹{Number(item.value).toLocaleString('en')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddSpending = () => {
    Create(newSpending).then((res) => {
      if (res.status) {
        Toast.show({
          type: 'success',
          text1: 'Record created successfully!!',
        });
      } else {
        console.log("res.msg", res)
        Toast.show({
          type: 'error',
          text1: res.msg,
        });
      }
      setFetch((prev) => !prev);
    });
    setNewSpending({ value: '', date: new Date(), name: '', type: 'debit', spendingtype: '', paymenttype: 'paid' });
    setModalVisible(false);
  };

  const borrowedItem = ({ item }) => {
    const GetIconWithType = ({ type }) => {
      if (type === 'Income') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#4ade80" }}>
            <FontAwesome name="rupee" size={22} color="black" />
          </View>
        )
      } else if (type === 'Travel') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#a78bfa" }}>
            <FontAwesome name="car" size={22} color="black" />
          </View>
        )
      } else if (type === 'Food') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#2dd4bf" }}>
            <Ionicons name="fast-food" size={22} color="black" />
          </View>
        )
      } else if (type === 'Coffee') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#fbbf24" }}>
            <MaterialIcons name="coffee" size={22} color="black" />
          </View>
        )
      } else if (type === 'Haarvish') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#fb7185" }}>
            <AntDesign name="heart" size={22} color="black" />
          </View>
        )
      } else if (type === 'Brunda') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#e879f9" }}>
            <FontAwesome6 name="handshake-simple" size={22} color="black" />
          </View>
        )
      } else if (type === 'Simpl') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#22d3ee" }}>
            <FontAwesome5 name="credit-card" size={22} color="black" />
          </View>
        )
      } else if (type === 'Chats') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#a3e635" }}>
            <Icon name="food-fork-drink" size={22} color="black" />
          </View>
        )
      } else if (type === 'Petrol') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#facc15" }}>
            <Icon name="scooter" size={22} color="black" />
          </View>
        )
      } else if (type === 'EMI') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#2dd4bf" }}>
            <MaterialIcons name="payments" size={22} color="black" />
          </View>
        )
      } else if (type === 'Bank') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#34d399" }}>
            <Icon name="bank" size={22} color="black" />
          </View>
        )
      } else if (type === 'Others') {
        return (
          <View style={{ ...styles.getIcon, backgroundColor: "#818cf8" }}>
            <FontAwesome name="money" size={22} color="black" />
          </View>
        )
      }
    }

    return (
      <TouchableOpacity
        onPress={() => {
          setEditSpending(item);
          setModalVisibleEdit(true);
        }}
        style={styles.borrowlistItem}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <GetIconWithType type={item.spendingtype} />
          <View>
            <Text style={{ ...styles.listvalue, marginTop: 5, color: 'white', fontSize: 18 }}>
              ₹{Number(item.value).toLocaleString('en')}
            </Text>
            {
              item.status == 'paid' && <Text style={{ ...styles.listvalue, fontFamily: 'Montserrat-SemiBold', marginTop: 5, color: '#28a745', fontSize: 14 }}>Paid</Text>
            }
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.listDate}>{getFormattedDate(item.date)}</Text>
          <Text style={{ ...styles.listname, fontSize: 16 }}>{item.spendingtype}</Text>
        </View>

      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={background} style={styles.backgroundImage} resizeMode="cover">
        <View style={{ ...styles.header, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 }}>
          <Text style={styles.date}>Hey, Priyanka!</Text>
          <Image source={require('./asset/profileimg.png')} style={{ width: 50, height: 50, borderRadius: 50 }}></Image>
        </View>
        <View style={styles.main}>
          <ImageBackground style={{ padding: 20 }} imageStyle={{ borderRadius: 10 }} source={require('./asset/cardbg.png')}>
            <View>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balance}>₹{Number(balance).toLocaleString('en')}</Text>
            </View>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.spendingLabel}>Today's Spendings</Text>
              <Text style={styles.spending}>₹{Number(todayspent).toLocaleString('en')}</Text>
            </View>
          </ImageBackground>
        </View>
        <ScrollView>
          {borrowings?.length > 0 &&
            <View style={styles.list}>
              <Text style={styles.listHeader}>Your Borrowings</Text>
              <FlatList
                horizontal
                data={borrowings}
                renderItem={borrowedItem}
                keyExtractor={(item) => item.id.toString()}
              />
            </View>
          }
          <FlatList
            data={spendings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            ListHeaderComponent={<Text style={styles.listHeader}>Spendings List</Text>}
          />
        </ScrollView>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', width: '100%' }}>
                <View></View>
                <TouchableOpacity style={{}} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalCardLabel}>Add your spendings</Text>
              <View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                <ToggleSwitch
                  isOn={newSpending.type === 'credit'}
                  onColor="green"
                  offColor="red"
                  label={newSpending.type}
                  labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
                  size="medium"
                  onToggle={(isOn) => {
                    setNewSpending({ ...newSpending, type: isOn ? 'credit' : 'debit' });
                  }}
                />
                <ToggleSwitch
                  isOn={newSpending.paymenttype === 'borrowed'}
                  onColor="red"
                  offColor="green"
                  label={newSpending.paymenttype}
                  labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
                  size="medium"
                  onToggle={(isOn) => {
                    setNewSpending({ ...newSpending, paymenttype: isOn ? 'borrowed' : 'paid' });
                  }}
                />
              </View>
              <View style={styles.modalComp}>
                <Text style={styles.modalCardLabelSmall}>Type</Text>
                <SelectDropdown
                  data={Options}
                  onSelect={(selectedItem, index) => {
                    setNewSpending({ ...newSpending, spendingtype: selectedItem });
                  }}
                  renderButton={(selectedItem, isOpened) => {
                    return (
                      <View style={styles.dropdownButtonStyle}>
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {(selectedItem) || 'None'}
                        </Text>
                        <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                      </View>
                    );
                  }}
                  renderItem={(item, index, isSelected) => {
                    return (
                      <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                        <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                        <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                      </View>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  dropdownStyle={styles.dropdownMenuStyle}
                />
              </View>
              <View style={styles.modalComp}>
                <Text style={styles.modalCardLabelSmall}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={newSpending.name}
                  onChangeText={(text) => setNewSpending({ ...newSpending, name: text })}
                />
              </View>
              <View style={styles.modalComp}>
                <Text style={styles.modalCardLabelSmall}>Amount</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newSpending.value}
                  onChangeText={(text) => setNewSpending({ ...newSpending, value: text })}
                />
              </View>
              <View style={styles.modalComp}>
                <Text style={styles.modalCardLabelSmall}>Date</Text>
                <DatePicker
                  date={newSpending.date}
                  onDateChange={(date) => setNewSpending({ ...newSpending, date: date })}
                  mode="date"
                  style={styles.datePicker}
                  textColor="#eee"
                />
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={handleAddSpending}>
                  <Text style={styles.modalButtonText}>Add</Text>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', display: 'flex', width: '100%' }}>
                <View></View>
                <TouchableOpacity style={{}} onPress={() => setModalVisibleEdit(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalCardLabel}>Edit your spendings</Text>
              {editSpending && (
                <>
                  <View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                    <ToggleSwitch
                      isOn={editSpending.type === 'credit'}
                      onColor="green"
                      offColor="red"
                      label={editSpending.type}
                      labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
                      size="medium"
                      onToggle={(isOn) => {
                        setEditSpending({ ...editSpending, type: isOn ? 'credit' : 'debit' });
                      }}
                    />
                    <ToggleSwitch
                      isOn={editSpending.paymenttype === 'borrowed'}
                      onColor="red"
                      offColor="green"
                      label={editSpending.paymenttype}
                      labelStyle={{ color: "#f0fdfa", fontFamily: 'Montserrat-Medium' }}
                      size="medium"
                      onToggle={(isOn) => {
                        setEditSpending({ ...editSpending, paymenttype: isOn ? 'borrowed' : 'paid' });
                      }}
                    />
                  </View>
                  <View style={styles.modalComp}>
                    <Text style={styles.modalCardLabelSmall}>Type</Text>
                    <SelectDropdown
                      data={Options}
                      onSelect={(selectedItem, index) => {
                        setEditSpending({ ...editSpending, spendingtype: selectedItem });
                      }}
                      renderButton={(selectedItem, isOpened) => {
                        return (
                          <View style={styles.dropdownButtonStyle}>
                            <Text style={styles.dropdownButtonTxtStyle}>
                              {(selectedItem) || 'None'}
                            </Text>
                            <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} />
                          </View>
                        );
                      }}
                      renderItem={(item, index, isSelected) => {
                        return (
                          <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                            <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
                            <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                          </View>
                        );
                      }}
                      showsVerticalScrollIndicator={false}
                      dropdownStyle={styles.dropdownMenuStyle}
                    />
                  </View>
                  <View style={styles.modalComp}>
                    <Text style={styles.modalCardLabelSmall}>Name</Text>
                    <TextInput
                      style={styles.input}
                      value={editSpending.name}
                      onChangeText={(text) => setEditSpending({ ...editSpending, name: text })}
                    />
                  </View>
                  <View style={styles.modalComp}>
                    <Text style={styles.modalCardLabelSmall}>Amount</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editSpending.value}
                      onChangeText={(text) => setEditSpending({ ...editSpending, value: text })}
                    />
                  </View>
                  <View style={styles.modalComp}>
                    <Text style={styles.modalCardLabelSmall}>Date</Text>
                    <DatePicker
                      date={new Date(editSpending.date)}
                      onDateChange={(date) => setEditSpending({ ...editSpending, date: date })}
                      mode="date"
                      style={styles.datePicker}
                      textColor="#eee"
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { handleDelete(); }}>
                      <Text style={styles.modalButtonText}>Delete</Text>
                      <MaterialIcons name="delete" size={20} color="#dc2626" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={handleEditSpending}>
                      <Text style={styles.modalButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
        <Toast position='top' swipeable={true} />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    width: '100%',
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    color: '#151E26',
    fontFamily: 'Montserrat-Regular',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
    color: 'black'
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    color: '#151E26',
    fontFamily: 'Montserrat-Regular',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  date: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'Montserrat-Bold',
  },
  main: {
    backgroundColor: '#3b82f6',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10
  },
  balanceLabel: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat-Medium',
  },
  balance: {
    fontSize: 30,
    color: 'white',
    fontFamily: 'Montserrat-Bold',
  },
  spendingLabel: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat-Medium',
  },
  spending: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Montserrat-SemiBold',
  },
  list: {
    paddingHorizontal: 20,
  },
  borrowlist: {
    paddingHorizontal: 20,
  },
  listHeader: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'Montserrat-Bold',
    marginVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderColor: '#404040',
    borderWidth: 1,
    alignItems: 'center'
  },
  borrowlistItem: {
    width: 170,
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#fff',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    borderColor: '#404040',
    borderWidth: 1,
  },
  getIcon: {
    width: 45,
    height: 45,
    borderRadius: 16,
    shadowColor: '#fff',
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listname: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat-SemiBold',
  },
  listDate: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Montserrat-Medium',
  },
  listvalue: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  listbuttonedit: {
    marginLeft: 10,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'white',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalCardLabel: {
    fontSize: 20,
    color: '#f0fdfa',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 20,
  },
  modalCardLabelSmall: {
    fontSize: 16,
    color: '#f0fdfa',
    fontFamily: 'Montserrat-Medium',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 20,
    color: 'black'
  },
  datePicker: {
    width: 250,
    marginBottom: 20,
  },
  modalComp: {
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#60a5fa',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: '#dc2626',
    borderWidth: 2,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center'
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
  },
  cancleButtonText: {
    color: '#ef4444',
    fontFamily: 'Montserrat-Medium',
  },
});

export default MoneyTracker;
