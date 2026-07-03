import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { ScreenContainer, Input, NeonButton, GlassCard } from '../../components/ui';
import { setRoom, watchRoom } from '../../services/tournamentService';
import { sendNotification } from '../../services/notificationService';
import { spacing, typography, colors } from '../../theme';
import { isRequired, validate } from '../../utils/validators';
import { notify } from '../../utils/notify';

export default function RoomManagerScreen({ route, navigation }) {
  const { tournament } = route.params;
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => watchRoom(tournament.id, (room) => {
    if (!loaded && room) {
      setRoomId(room.roomId || '');
      setPassword(room.password || '');
      setMatchTime(room.matchTime || '');
    }
    setLoaded(true);
  }), [tournament.id]);

  const onSave = async (announce) => {
    const err = validate({ roomId, password }, {
      roomId: [{ test: isRequired, msg: 'Room ID is required' }],
      password: [{ test: isRequired, msg: 'Password is required' }],
    });
    if (err) return notify('Check details', err);
    setLoading(true);
    try {
      await setRoom(tournament.id, { roomId: roomId.trim(), password: password.trim(), matchTime: matchTime.trim() });
      if (announce) {
        await sendNotification({
          title: '🔑 Room ID Released!',
          body: `Room details for ${tournament.name} are live. Open the tournament page to view them.`,
          type: 'room_released',
          tournamentId: tournament.id,
        });
      }
      notify('Saved ✅', announce ? 'Room saved and players notified.' : 'Room saved.');
      navigation.goBack();
    } catch (e) {
      notify('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Match Room</Text>
      <Text style={[typography.caption, { marginBottom: spacing.xl }]}>{tournament.name}</Text>

      <GlassCard style={{ borderColor: colors.warning + '66' }}>
        <Text style={typography.caption}>
          ⚠️ Only players with approved payments can see these details in the app.
        </Text>
      </GlassCard>

      <Input label="Room ID" value={roomId} onChangeText={setRoomId} placeholder="e.g. 5482913" />
      <Input label="Password" value={password} onChangeText={setPassword} placeholder="e.g. WIN99" />
      <Input label="Match Time (optional)" value={matchTime} onChangeText={setMatchTime} placeholder="e.g. 8:00 PM sharp" />

      <NeonButton title="SAVE & NOTIFY PLAYERS" onPress={() => onSave(true)} loading={loading} />
      <NeonButton title="Save silently" variant="outline" onPress={() => onSave(false)} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}
