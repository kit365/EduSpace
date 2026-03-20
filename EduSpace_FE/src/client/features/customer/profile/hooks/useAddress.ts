import { useState, useEffect, useCallback, useRef } from 'react';
import { addressService, Province, District, Ward } from '../services/addressService';

export interface UseAddressInitial {
  provinceName?: string;
  districtName?: string;
  wardName?: string;
}

export function useAddress(initial?: UseAddressInitial) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | undefined>();
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | undefined>();
  const [selectedWardCode, setSelectedWardCode] = useState<number | undefined>();

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const hasSyncedProvince = useRef(false);
  const hasSyncedDistrict = useRef(false);
  const hasSyncedWard = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingProvinces(true);
    setError(null);
    addressService
      .getProvinces()
      .then((list) => {
        if (!cancelled) {
          setProvinces(list);
          if (initial?.provinceName && !hasSyncedProvince.current) {
            const p = list.find((x) => x.name === initial.provinceName);
            if (p) {
              hasSyncedProvince.current = true;
              setSelectedProvinceCode(p.code);
            }
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Không tải được danh sách tỉnh/thành');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedProvinceCode == null) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
      hasSyncedDistrict.current = false;
      hasSyncedWard.current = false;
      return;
    }
    let cancelled = false;
    setLoadingDistricts(true);
    setWards([]);
    setSelectedWardCode(undefined);
    hasSyncedWard.current = false;
    addressService
      .getDistricts(selectedProvinceCode)
      .then((list) => {
        if (!cancelled) {
          setDistricts(list);
          if (initial?.districtName && !hasSyncedDistrict.current) {
            const d = list.find((x) => x.name === initial.districtName);
            if (d) {
              hasSyncedDistrict.current = true;
              setSelectedDistrictCode(d.code);
            }
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDistricts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (selectedDistrictCode == null) {
      setWards([]);
      setSelectedWardCode(undefined);
      hasSyncedWard.current = false;
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    addressService
      .getWards(selectedDistrictCode)
      .then((list) => {
        if (!cancelled) {
          setWards(list);
          if (initial?.wardName && !hasSyncedWard.current) {
            const w = list.find((x) => x.name === initial.wardName);
            if (w) {
              hasSyncedWard.current = true;
              setSelectedWardCode(w.code);
            }
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDistrictCode]);

  // Reset sync refs when closing edit (initial becomes undefined)
  useEffect(() => {
    if (!initial) {
      hasSyncedProvince.current = false;
      hasSyncedDistrict.current = false;
      hasSyncedWard.current = false;
    }
  }, [initial]);

  // Sync selection from initial when opening edit (provinces may already be loaded)
  useEffect(() => {
    if (!initial?.provinceName || provinces.length === 0) return;
    if (hasSyncedProvince.current) return;
    const p = provinces.find((x) => x.name === initial.provinceName);
    if (p) {
      hasSyncedProvince.current = true;
      setSelectedProvinceCode(p.code);
    }
  }, [initial?.provinceName, provinces]);

  useEffect(() => {
    if (!initial?.districtName || districts.length === 0) return;
    if (hasSyncedDistrict.current) return;
    const d = districts.find((x) => x.name === initial.districtName);
    if (d) {
      hasSyncedDistrict.current = true;
      setSelectedDistrictCode(d.code);
    }
  }, [initial?.districtName, districts]);

  useEffect(() => {
    if (!initial?.wardName || wards.length === 0) return;
    if (hasSyncedWard.current) return;
    const w = wards.find((x) => x.name === initial.wardName);
    if (w) {
      hasSyncedWard.current = true;
      setSelectedWardCode(w.code);
    }
  }, [initial?.wardName, wards]);

  const setProvince = useCallback((code: number | undefined) => {
    setSelectedProvinceCode(code);
    setSelectedDistrictCode(undefined);
    setSelectedWardCode(undefined);
  }, []);

  const setDistrict = useCallback((code: number | undefined) => {
    setSelectedDistrictCode(code);
    setSelectedWardCode(undefined);
  }, []);

  const setWard = useCallback((code: number | undefined) => {
    setSelectedWardCode(code);
  }, []);

  const selectedProvince = provinces.find((p) => p.code === selectedProvinceCode);
  const selectedDistrict = districts.find((d) => d.code === selectedDistrictCode);
  const selectedWard = wards.find((w) => w.code === selectedWardCode);

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    error,
    selectedProvinceCode,
    selectedDistrictCode,
    selectedWardCode,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setProvince,
    setDistrict,
    setWard,
  };
}
