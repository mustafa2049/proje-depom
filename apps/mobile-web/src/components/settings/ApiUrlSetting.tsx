import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { useConnectionStore } from '../../store/useConnectionStore';
import { normalizeApiUrl, pointsToDeviceItself } from '../../utils/apiUrl';
import { Button } from '../ui/Button';
import { TextField } from '../ui/TextField';

/**
 * Sunucu adresi (API URL) ayarı. Telefonda "localhost" cihazın kendisini gösterdiği için
 * bilgisayarın yerel IP'si (http://192.168.1.X:3000) veya canlı sunucu adresi girilmelidir.
 */
export function ApiUrlSetting() {
  const apiUrl = useConnectionStore((state) => state.apiUrl);
  const setApiUrl = useConnectionStore((state) => state.setApiUrl);

  const [draft, setDraft] = useState(apiUrl);
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(apiUrl);
  }, [apiUrl]);

  function save() {
    setSaved(false);
    const result = normalizeApiUrl(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(undefined);
    setApiUrl(result.url);
    setDraft(result.url);
    setSaved(true);
  }

  const warnLocalhost = Platform.OS !== 'web' && pointsToDeviceItself(apiUrl);

  return (
    <View className="gap-3">
      <TextField
        label="Sunucu Adresi (API URL)"
        value={draft}
        onChangeText={(value) => {
          setDraft(value);
          setSaved(false);
        }}
        placeholder="http://192.168.1.20:3000"
        autoCapitalize="none"
        error={error}
        testID="api-url-input"
      />
      <Text className="text-xs text-muted">
        Bilgisayarındaki sunucu için yerel IP adresini (ör. http://192.168.1.20:3000) veya canlı sunucu adresini gir.
      </Text>
      {warnLocalhost ? (
        <Text className="text-xs text-warning">
          Telefonda "localhost" bu cihazın kendisini gösterir; bilgisayarının IP adresini kullan.
        </Text>
      ) : null}
      {saved ? <Text className="text-sm font-semibold text-success">Sunucu adresi kaydedildi ✓</Text> : null}
      <Button title="Adresi Kaydet" variant="secondary" onPress={save} testID="api-url-save" />
    </View>
  );
}
