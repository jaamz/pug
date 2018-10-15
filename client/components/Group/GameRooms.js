import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  fetchJoinableRooms,
  fetchJoinedRooms,
  changeChatRoom,
  checkRoomAvailability,
  joinRoom
} from '../Redux/Actions';

import { Text, View } from 'react-native'
import { List, ListItem } from 'react-native-elements'

import { CHATKIT_USER_NAME } from '../../config/info';

class GameRooms extends Component {
  state = {}

  componentDidMount() {
    const { fetchJoinableRooms, fetchJoinedRooms, navigation } = this.props;
    const game = navigation.getParam('serverName', "BAD SERVER GAME PARAM");

    fetchJoinableRooms(game, CHATKIT_USER_NAME);
    fetchJoinedRooms(game, CHATKIT_USER_NAME);
  }

  selectRoom = room => () => {
    const { navigation, changeChatRoom } = this.props;
    changeChatRoom(room.id);
    navigation.navigate('Chatroom', { title: room.name });
  }

  /** Add Join Room Logic  */
  joinRoom = room => () => {
    const { navigation, changeChatRoom, checkRoomAvailability } = this.props;
    // Axios call to check if room is full
    let allowed = checkRoomAvailability(CHATKIT_USER_NAME, room.id);
    console.log("Trying to join room");
    if(allowed) {
      joinRoom(room.id);
      changeChatRoom(room.id);
      navigation.navigate('Chatroom', { title: room.name});
    } else {
      console.log("Cannot join room");
    }
  }

  render() {
    /**
     * ISSUE:
     * 
     * Should render a loading gif whenever in process of fetching new JoinableRooms / JoinedRooms
     * Currently showing preloaded rooms before changing to new ones
     * 
     */

    const { joinableRooms, joinedRooms } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <List containerStyle={{ marginBottom: 20 }}>
          {
            joinedRooms.map((room) => (
              <ListItem
                onPress={this.selectRoom(room)}
                key={room.id}
                title={room.name}
              />
            ))
          }
        </List>
        {
          /* 
          Need to implement joining a room that I am currently not in; 
          otherwise if I click the room it will yell that I am not authorized
          */
        }
        <List containerStyle={{ marginBottom: 20 }}>
          {
            joinableRooms.map((room) => (
              <ListItem
                onPress={this.joinRoom(room)}
                key={room.id}
                title={room.name}
              />
            ))
          }
        </List>
      </View>
    );
  }
}

const mapStateToProps = ({ roomReducer }) => ({
  joinableRooms: roomReducer.joinableRooms,
  joinedRooms: roomReducer.joinedRooms
})

const mapDispatchToProps = dispatch => ({
  changeChatRoom: roomId => dispatch(changeChatRoom(roomId)),
  fetchJoinableRooms: (game, userId) => dispatch(fetchJoinableRooms(game, userId)),
  fetchJoinedRooms: (game, userId) => dispatch(fetchJoinedRooms(game, userId)),
  // ToDo: - Add action dispatch
  checkRoomAvailability: (userId, roomId) => dispatch(checkRoomAvailability(userId, roomId)),
  joinRoom: (roomId) => dispatch(joinRoom(roomId))

})

export default connect(mapStateToProps, mapDispatchToProps)(GameRooms);