import Link from "next/link";
import Layout from "../../../components/Layout/Layout";
import AnimatePage from "../../../components/Shared/AnimatePage/AnimatePage";
import getConfig from "next/config";
import { FaBook, FaPen, FaPlus, FaTrashAlt, FaRegCalendarAlt, FaLightbulb, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { deleteMateri, getMateri } from "../../../client/MateriClient";
import { getDetailMateri } from "../../../client/MateriClient";
import { useEffect, useState, useRef } from "react";
import useUser from "../../../hooks/useUser";
import ModalTambahMateri from "../../../components/Materi/ModalTambahMateri";
import router, { useRouter } from "next/router";
import { ssURL } from "../../../client/clientAxios";
import Navbar from "../../../components/Shared/Navbar/Navbar";
import CardKelasSkeleton from "../../../components/Shared/Skeleton/CardKelasSkeleton";
import toast from "react-hot-toast";
import swal from "sweetalert";
import Joyride from "react-joyride";
import useJoyride from "../../../hooks/useJoyride";
import MyJoyride from "../../../components/Shared/MyJoyride/MyJoyride";
import useTa from "hooks/useTa";
import SelectShared from "components/Shared/SelectShared/SelectShared";
import ModalUbahDataDashboard from "components/Layout/ModalUbahDataDashboard";
import { Empty } from "antd";

import { DateRangePicker, DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

function useBreakpointBelow(breakpoint = 1366) {
  const [breakpointBelow, setBreakpointBelow] = useState(false);
  useEffect(() => {
    const checkWXGA = () => setBreakpointBelow(window.innerWidth < breakpoint);
    checkWXGA();
    window.addEventListener('resize', checkWXGA);
    return () => window.removeEventListener('resize', checkWXGA);
  }, [breakpoint]);
  return breakpointBelow;
}

const index = ({ nav, m_ta_id }) => {
  const { joyrideConfig, setJoyrideConfig } = useJoyride();
  const { pathname } = useRouter();
  const { ta } = useTa();
  const [tipeTa, setTipeTA] = useState({ value: m_ta_id });
  const { user } = useUser();
  const [asideDropdownOpen, setAsideDropdownOpen] = useState(false);

  const getInitialFilter = (key, fallback) => {
    if (typeof window === 'undefined') return fallback;
    try {
      const val = localStorage.getItem(key);
      if (val === null) return fallback;
      if (key === 'dateRange' || key === 'tempDateRange') {
        const parsed = JSON.parse(val);

        if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === 'object') return parsed;
        return fallback;
      }
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const [searchMateri, setSearchMateri] = useState(() => getInitialFilter('searchMateri', ""));
  const [statusMateri, setStatusMateri] = useState(() => getInitialFilter('statusMateri', ""));
  const [muatanMateri, setMuatanMateri] = useState(() => getInitialFilter('muatanMateri', ""));
  const [dateRange, setDateRange] = useState(() => getInitialFilter('dateRange', [{ startDate: null, endDate: null, key: 'selection' }]));
  const [tempDateRange, setTempDateRange] = useState(() => getInitialFilter('tempDateRange', [{ startDate: null, endDate: null, key: 'selection' }]));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [materiData, setMateriData] = useState({});
  const isWXGA = useBreakpointBelow();
  const isMobile = useBreakpointBelow(576);
  const isBelow992 = useBreakpointBelow(992);

  const [searchXTranslate, setSearchXTranslate] = useState(0);
  const [searchInputWidth, setSearchInputWidth] = useState('');
  const [searchFormWidth, setSearchFormWidth] = useState('');

  const [cardGridCols, setCardGridCols] = useState(3);
  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;

      if (w < 576 || w >= 1400) {
        setSearchXTranslate(0);
        setSearchInputWidth('');
        setSearchFormWidth('');
      } else {
        const widths = {
          input: w < 768 ? '260px' : w < 1200 ? '440px' : '560px',
          form: w < 768 ? '280px' : w < 1200 ? '460px' : '580px',
        };
        setSearchInputWidth(widths.input);
        setSearchFormWidth(widths.form);
      }

      setCardGridCols(w < 768 ? 1 : w < 1200 ? 2 : 3);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [detailMateriList, setDetailMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [sortTopik, setSortTopik] = useState(() => getInitialFilter('sortTopik', 'desc'));
  const [progressMap, setProgressMap] = useState({});

  // Save filters to localStorage 
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('searchMateri', JSON.stringify(searchMateri));
  }, [searchMateri]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('statusMateri', JSON.stringify(statusMateri));
  }, [statusMateri]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('muatanMateri', JSON.stringify(muatanMateri));
  }, [muatanMateri]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dateRange', JSON.stringify(dateRange));
  }, [dateRange]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('tempDateRange', JSON.stringify(tempDateRange));
  }, [tempDateRange]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sortTopik', JSON.stringify(sortTopik));
  }, [sortTopik]);

  const getMateriData = async () => {
    setLoading(true);

    try {
      const { data } = await getMateri({ m_ta_id: tipeTa?.value || ta?.id });

      if (data && Array.isArray(data.materi)) {
        setMateriData(data);

        const detailPromises = data.materi.map((m) => getDetailMateri(m.id));
        const detailResults = await Promise.all(detailPromises);

        setDetailMateriList(detailResults.map((r) => r.data));

        const newProgressMap = {};
        detailResults.forEach((res, idx) => {
          const detail = res?.data;

          if (detail && Array.isArray(detail.bab)) {
            const totalTopik = detail.bab.reduce(
              (acc, bab) => acc + (bab.topik?.length || 0),
              0
            );

            const totalTopikSelesai = detail.bab.reduce((acc, bab) => {
              const selesai = (bab.topik || []).filter(
                (topik) => topik?.materiKesimpulan?.dibaca === 1
              ).length;
              return acc + selesai;
            }, 0);

            const progress =
              totalTopik === 0
                ? 0
                : Math.round((totalTopikSelesai / totalTopik) * 100);

            newProgressMap[data.materi[idx]?.id] = progress;
          } else {
            newProgressMap[data.materi[idx]?.id] = 0;
          }
        });

        setProgressMap(newProgressMap);
      } else {
        setMateriData(null);
        setProgressMap({});
      }
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMateriData();
  }, []);

  // Render isi detailMateriList ke console
  // useEffect(() => {
  //   if (detailMateriList.length) {
  //     detailMateriList.forEach((item, index) => {
  //       const namaMateri = item.materi?.mataPelajaran?.nama || "(materi tidak ada)";
  //       console.log(`Materi ${index + 1}: ${namaMateri}`);

  //       let lastReadTime = null;
  //       let lastReadTopik = null;

  //       item.bab?.forEach((bab, babIdx) => {
  //         console.log(`  Bab ${babIdx + 1}: ${bab.judul}`);

  //         bab.topik?.forEach((topik, topikIdx) => {
  //           console.log(`    Topik ${topikIdx + 1}: ${topik.judul}`);
  //           if (topik.createdAt) {
  //             console.log(`      Dibuat: ${topik.createdAt}`);
  //           }
  //           if (topik.updatedAt) {
  //             console.log(`      Terakhir diupdate: ${topik.updatedAt}`);
  //           }
  //           if (topik.materiKesimpulan) {
  //             console.log(`      Kesimpulan: ${topik.materiKesimpulan.kesimpulan}`);
  //             console.log(`      Dibaca: ${topik.materiKesimpulan.dibaca}`);
  //             console.log(`      Durasi: ${topik.materiKesimpulan.durasi}`);
  //             // Log setiap kali topik pernah dibaca
  //             if (topik.materiKesimpulan.waktuSelesai || topik.materiKesimpulan.waktuMulai) {
  //               const waktu = topik.materiKesimpulan.waktuSelesai || topik.materiKesimpulan.waktuMulai;
  //               console.log(`      dibaca pada ${waktu} pada topik '${topik.judul}'`);
  //             }
  //             // Cek waktu terakhir dibaca
  //             const waktuMulai = topik.materiKesimpulan.waktuMulai;
  //             const waktuSelesai = topik.materiKesimpulan.waktuSelesai;
  //             let waktuTerakhir = null;
  //             if (waktuSelesai) {
  //               waktuTerakhir = waktuSelesai;
  //             } else if (waktuMulai) {
  //               waktuTerakhir = waktuMulai;
  //             }
  //             if (waktuTerakhir && (!lastReadTime || new Date(waktuTerakhir) > new Date(lastReadTime))) {
  //               lastReadTime = waktuTerakhir;
  //               lastReadTopik = topik.judul;
  //             }
  //           } else {
  //             console.log(`      (Belum ada kesimpulan)`);
  //           }
  //         });
  //       });
  //       if (lastReadTime && lastReadTopik) {
  //         console.log(`  Terakhir dibaca ${lastReadTime} pada topik '${lastReadTopik}'`);
  //       }
  //     });
  //   }
  // }, [detailMateriList]);

  // useEffect(() => {
  //   if (materiData) {
  //     console.log("ISI STATE materiData:", materiData);
  //   }
  // }, [materiData]);

  const { materi, materiLainnya, semuaTA, dataTA } = materiData;
  const datePickerRef = useRef(null);
  const [stickyTop, setStickyTop] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const topOnLoad = rect.top + scrollY;
      setStickyTop(topOnLoad);
    }
  }, []);

  const changeTA = (value) => {
    setTipeTA(value);
    swal({
      title: "Yakin Mengubah Data",
      text: "Data akan berubah sesuai tahun yang Anda pilih.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data } = await gantiTaUser({ m_ta_id: tipeTA });
        if (data) {
          router.push({
            pathname: router?.pathname,
            query: { ...router?.query, m_ta_id: value?.value },
          });
          hideModal("modalUbahDataTahun");
          getRombelData();
        }
      }
    });
  };

  const onClickEdit = (data) => {
    setEditData({
      nama: data.nama,
      id: data.id,
    });
  };

  const navItems = [
    {
      url: `${ssURL}/materi?nav=materi`,
      text: "Materi",
      active: nav == "materi" || !nav,
      dataJoyride: "materi",
    },
  ];

  const steps = [
    {
      target: '[data-joyride="materi"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Materi</h5>
          <p className="color-secondary fw-semibold">
            {user?.role == "guru" ? (
              <>Daftar materi yang anda ajar untuk murid murid anda.</>
            ) : (
              <>Daftar materi dari guru guru yang mengajar kamu.</>
            )}
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="btn-tambah-materi"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Ingin Menambah Materi Baru?</h5>
          <p className="color-secondary fw-semibold">
            Tekan tombol "Tambah Materi" untuk menambah materi baru yang akan
            diajarkan kepada murid murid anda.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="card-materi"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Materi</h5>
          <p className="color-secondary fw-semibold">
            {user?.role == "guru" ? (
              <>Daftar materi yang anda yang ajarkan kepada siswa anda</>
            ) : (
              <>Daftar materi yang diajarkan guru kamu</>
            )}
          </p>
        </div>
      ),
    },
  ];

  const action = [
    {
      button:
        (user?.role === "guru" ||
          user?.role == "kepsek" ||
          user?.role == "alumni" ||
          user?.role == "kewiraswastaan" ||
          user?.role == "industri") &&
        "",
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { action } = data;
    if (action === "reset" || action === "close") {
      setJoyrideConfig({ ...joyrideConfig, [pathname]: true });
    }
  };

  const handleDeleteMateriLainnya = async (id) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Perhatikan kembali data yang ingin anda hapus",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteMateri(id);
        if (data) {
          toast.success(data?.message);
          getMateriData();
        } else {
          toast.error(error?.message);
        }
      }
    });
  };

  const NavbarMateri = ({ }) => (
    <>
      <Navbar
        nav={navItems}
        action={[
          {
            button: (
              <div className="select-akun-keuangan ms-5" style={{ width: "300px" }}></div>
            ),
          },
        ]}
      />
    </>
  );

  useEffect(() => {
    getMateriData();
  }, [m_ta_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
        setTempDateRange(dateRange);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, dateRange]);

  const handleDone = () => {
    setDateRange(tempDateRange);
    setShowDatePicker(false);
  };

  const isGuruOrAdmin = user?.role === "guru" || user?.role === "admin";
  let filteredMateri = materi || [];
  if (!isGuruOrAdmin) {
    if (sortTopik) {
      filteredMateri = filteredMateri.slice().sort((a, b) => {
        const detailA = detailMateriList.find((item) => item?.materi?.id === a.id);
        const detailB = detailMateriList.find((item) => item?.materi?.id === b.id);
        const getLastReadTime = (detail) => {
          if (!detail || !Array.isArray(detail.bab)) return null;
          let lastTime = null;
          detail.bab.forEach(bab => {
            if (Array.isArray(bab.topik)) {
              bab.topik.forEach(topik => {
                if (topik.materiKesimpulan) {
                  const waktuSelesai = topik.materiKesimpulan.waktuSelesai;
                  const waktuMulai = topik.materiKesimpulan.waktuMulai;
                  const waktu = waktuSelesai || waktuMulai;
                  if (waktu && (!lastTime || new Date(waktu) > new Date(lastTime))) {
                    lastTime = waktu;
                  }
                }
              });
            }
          });
          return lastTime;
        };
        
        const getTopikCreatedAt = (detail, mode) => {
          if (!detail || !Array.isArray(detail.bab)) return null;
          let allTopik = [];
          detail.bab.forEach(bab => {
            if (Array.isArray(bab.topik)) allTopik = allTopik.concat(bab.topik);
          });
          if (!allTopik.length) return null;
          if (mode === 'desc') {
            return allTopik.reduce((max, t) => t.createdAt && (!max || new Date(t.createdAt) > new Date(max)) ? t.createdAt : max, null);
          } else {
            return allTopik.reduce((min, t) => t.createdAt && (!min || new Date(t.createdAt) < new Date(min)) ? t.createdAt : min, null);
          }
        };
        let aTime, bTime;
        if (sortTopik === 'lastread') {
          aTime = getLastReadTime(detailA);
          bTime = getLastReadTime(detailB);
        } else {
          aTime = getTopikCreatedAt(detailA, sortTopik);
          bTime = getTopikCreatedAt(detailB, sortTopik);
        }
        if (!aTime && !bTime) return 0;
        if (!aTime) return 1;
        if (!bTime) return -1;
        return new Date(bTime) - new Date(aTime);
      });
    }
    if (searchMateri) {
      filteredMateri = filteredMateri.filter((d) =>
        d.mataPelajaran?.nama?.toLowerCase().includes(searchMateri.toLowerCase())
      );
    }
    if (muatanMateri) {
      filteredMateri = filteredMateri.filter((d) => {
        const kelompok = d.mataPelajaran?.kelompok;
        if (muatanMateri === "umum") {
          return kelompok === "A";
        } else if (muatanMateri === "produktif") {
          return kelompok === "B" || kelompok === "C";
        }
        return true;
      });
    }
    if (statusMateri) {
      filteredMateri = filteredMateri.filter((d) => {
        const detail = detailMateriList.find((item) => item?.materi?.id === d.id);
        let totalTopik = 0;
        let topikDibaca = 0;
        if (detail && Array.isArray(detail.bab)) {
          totalTopik = detail.bab.reduce((acc, bab) => acc + (bab.topik?.length || 0), 0);
          topikDibaca = detail.bab.reduce(
            (acc, bab) =>
              acc +
              (bab.topik?.filter(
                (topik) =>
                  topik?.materiKesimpulan?.waktuMulai ||
                  topik?.materiKesimpulan?.waktuSelesai
              ).length || 0),
            0
          );
        }
        const progress = totalTopik > 0 ? Math.round((topikDibaca / totalTopik) * 100) : 0;
        if (statusMateri === "sudah") {
          return progress === 100;
        } else if (statusMateri === "belum") {
          return totalTopik > 0 && progress < 100;
        }
        return true;
      });
    }

    if (dateRange[0].startDate && dateRange[0].endDate) {
      filteredMateri = filteredMateri.filter((d) => {
        const detail = detailMateriList.find((item) => item?.materi?.id === d.id);
        if (!detail || !Array.isArray(detail.bab)) return false;
        const start = new Date(format(dateRange[0].startDate, 'yyyy-MM-dd'));
        const end = new Date(format(dateRange[0].endDate, 'yyyy-MM-dd'));
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        let found = false;
        detail.bab.forEach((bab) => {
          if (Array.isArray(bab.topik)) {
            bab.topik.forEach((topik) => {
              if (topik.materiKesimpulan) {
                const waktuMulai = topik.materiKesimpulan.waktuMulai;
                const waktuSelesai = topik.materiKesimpulan.waktuSelesai;
                const waktuArr = [waktuMulai, waktuSelesai].filter(Boolean);
                waktuArr.forEach((waktu) => {
                  const tgl = new Date(waktu);
                  const tglDate = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate());
                  if (tglDate >= startDate && tglDate <= endDate) {
                    found = true;
                  }
                });
              }
            });
          }
        });
        return found;
      });
    }
  }

  return (
    <Layout>
      <MyJoyride steps={steps} />
      <AnimatePage>
        <div className="row">
          {!isGuruOrAdmin && (
            <>
              {isBelow992 ? (
                <div style={{ position: 'block', top: 0, zIndex: 20, borderRadius: 16, marginBottom: 16 }} className="gap-2">
                  <button
                    className="w-100 d-flex align-items-center justify-content-between px-4 py-3 bg-white fw-bold fs-5"
                    style={{
                      borderRadius: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: 'none',
                      outline: 'none',
                      marginBottom: asideDropdownOpen ? 16 : 0
                    }}
                    onClick={() => setAsideDropdownOpen((v) => !v)}
                  >
                    Filter & Sortir
                    <span style={{
                      display: 'inline-block',
                      transition: 'transform 0.3s',
                      transform: asideDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <FaChevronDown />
                    </span>
                  </button>
                  <div style={{ display: asideDropdownOpen ? 'block' : 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 16, background: '#fff', overflow: 'visible', transition: 'none', position: 'relative' }}>
                    <div className="card card-ss p-4 border-0 bg-white" style={{ borderRadius: 16, boxShadow: 'none', minHeight: 0 }}>
                      {/* Sort Topik */}
                      <div className="mb-4">
                        <div className="fw-bold fs-5 mb-3" style={{ color: '#2c3252' }}>Urutkan</div>
                        <div className="form-check mb-3 ms-2">
                          <input className="form-check-input" type="radio" name="sortTopik" id="sortTerbaru" value="desc" checked={sortTopik === 'desc'} onChange={() => setSortTopik('desc')} />
                          <label className="form-check-label fw-bold" htmlFor="sortTerbaru" style={{ color: sortTopik === 'desc' ? '#2c3252' : '#a0a4b8' }}>Terbaru</label>
                        </div>
                        <div className="form-check mb-3 ms-2">
                          <input className="form-check-input" type="radio" name="sortTopik" id="sortTerlama" value="asc" checked={sortTopik === 'asc'} onChange={() => setSortTopik('asc')} />
                          <label className="form-check-label fw-bold" htmlFor="sortTerlama" style={{ color: sortTopik === 'asc' ? '#2c3252' : '#a0a4b8' }}>Terlama</label>
                        </div>
                        <div className="form-check ms-2">
                          <input className="form-check-input" type="radio" name="sortTopik" id="sortLastRead" value="lastread" checked={sortTopik === 'lastread'} onChange={() => setSortTopik('lastread')} />
                          <label className="form-check-label fw-bold" htmlFor="sortLastRead" style={{ color: sortTopik === 'lastread' ? '#2c3252' : '#a0a4b8' }}>Terakhir Dikerjakan</label>
                        </div>
                      </div>
                      {/* Date Picker */}
                      <div className="position-relative mb-4">
                        <label className="fw-bold fs-6 mb-2" style={{ color: '#2c3252' }}>Dikerjakan pada</label>
                        <div className="position-relative">
                          <FaRegCalendarAlt className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 2 }} />
                          <input type="text" className="form-control fw-semibold text-dark border rounded ps-5 py-2" value={dateRange[0].startDate && dateRange[0].endDate ? `${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}` : ''} placeholder="Pilih Rentang Tanggal" onClick={() => setShowDatePicker(!showDatePicker)} readOnly style={{ cursor: 'pointer', backgroundColor: '#fff', paddingLeft: '40px', fontSize: isWXGA ? '14px' : 'inherit' }} />
                        </div>
                        {showDatePicker && (
                          <div className="position-absolute mt-2 border shadow rounded bg-white p-3" style={{ zIndex: 1000, width: isWXGA ? 'fit-content' : 'auto', maxWidth: isWXGA ? '95vw' : 'none' }} ref={datePickerRef}>
                            {isWXGA ? (
                              <DateRange editableDateInputs={true} onChange={item => setTempDateRange([item.selection])} moveRangeOnFirstSelection={false} ranges={tempDateRange} />
                            ) : (
                              <DateRangePicker onChange={item => setTempDateRange([item.selection])} showSelectionPreview={true} moveRangeOnFirstSelection={false} months={2} ranges={tempDateRange} direction="horizontal" />
                            )}
                            <div className="d-flex justify-content-end gap-2 mt-3" style={{ flexWrap: isMobile ? "wrap" : "nowrap" }}>
                              <div style={{ flex: isMobile ? 1 : "unset" }}>
                                <button type="button" className="btn btn-outline-secondary px-4 w-100" style={{ borderRadius: "10px" }} onClick={() => { setTempDateRange(dateRange); setShowDatePicker(false); }}>Batal</button>
                              </div>
                              <div style={{ flex: isMobile ? 1 : "unset" }}>
                                <button type="button" className="btn btn-primary px-4 w-100" style={{ borderRadius: "10px" }} onClick={handleDone}>Selesai</button>
                              </div>
                            </div>
                          </div>
                        )}
                        {(dateRange[0].startDate && dateRange[0].endDate) && (
                          <div className="mt-2">
                            <button type="button" className="btn btn-link text-danger fw-medium p-0 d-inline-flex align-items-center gap-1" onClick={() => setDateRange([{ startDate: null, endDate: null, key: 'selection' }])} style={{ fontSize: 14, textDecoration: 'none' }}>
                              <FaTrashAlt size={15} className="ms-2" />
                              Hapus Rentang Tanggal
                            </button>
                          </div>
                        )}
                      </div>
                      {/* Status Materi */}
                      <div className="mb-2">
                        <div className="fw-bold fs-5 mb-3" style={{ color: '#2c3252' }}>Status</div>
                        <div className="form-check mb-3 ms-2">
                          <input className="form-check-input" type="radio" name="statusMateri" id="statusAll" value="" checked={statusMateri === ""} onChange={() => setStatusMateri("")} />
                          <label className="form-check-label fw-bold" htmlFor="statusAll" style={{ color: statusMateri === "" ? '#2c3252' : '#a0a4b8' }}>Semua</label>
                        </div>
                        <div className="form-check mb-3 ms-2">
                          <input className="form-check-input" type="radio" name="statusMateri" id="statusBelum" value="belum" checked={statusMateri === "belum"} onChange={() => setStatusMateri("belum")} />
                          <label className="form-check-label fw-bold" htmlFor="statusBelum" style={{ color: statusMateri === "belum" ? '#2c3252' : '#a0a4b8' }}>Belum Selesai</label>
                        </div>
                        <div className="form-check ms-2">
                          <input className="form-check-input" type="radio" name="statusMateri" id="statusSudah" value="sudah" checked={statusMateri === "sudah"} onChange={() => setStatusMateri("sudah")} />
                          <label className="form-check-label fw-bold" htmlFor="statusSudah" style={{ color: statusMateri === "sudah" ? '#2c3252' : '#a0a4b8' }}>Sudah Selesai</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <aside className="col-lg-3 mb-4">
                  <div className="card card-ss p-4" ref={cardRef} style={{ borderRadius: 24, minHeight: 300, position: 'sticky', top: stickyTop, zIndex: 10 }}>
                    {/* Sort Topik */}
                    <div className="mb-4">
                      <div className="fw-bold fs-5 mb-3" style={{ color: '#2c3252' }}>Urutkan</div>
                      <div className="form-check mb-3 ms-2">
                        <input className="form-check-input" type="radio" name="sortTopik" id="sortTerbaru" value="desc" checked={sortTopik === 'desc'} onChange={() => setSortTopik('desc')} />
                        <label className="form-check-label fw-bold" htmlFor="sortTerbaru" style={{ color: sortTopik === 'desc' ? '#2c3252' : '#a0a4b8' }}>Terbaru</label>
                      </div>
                      <div className="form-check mb-3 ms-2">
                        <input className="form-check-input" type="radio" name="sortTopik" id="sortTerlama" value="asc" checked={sortTopik === 'asc'} onChange={() => setSortTopik('asc')} />
                        <label className="form-check-label fw-bold" htmlFor="sortTerlama" style={{ color: sortTopik === 'asc' ? '#2c3252' : '#a0a4b8' }}>Terlama</label>
                      </div>
                      <div className="form-check ms-2">
                        <input className="form-check-input" type="radio" name="sortTopik" id="sortLastRead" value="lastread" checked={sortTopik === 'lastread'} onChange={() => setSortTopik('lastread')} />
                        <label className="form-check-label fw-bold" htmlFor="sortLastRead" style={{ color: sortTopik === 'lastread' ? '#2c3252' : '#a0a4b8' }}>Terakhir Dikerjakan</label>
                      </div>
                    </div>
                    {/* Date Picker */}
                    <div className="position-relative mb-4">
                      <label className="fw-bold fs-6 mb-2" style={{ color: '#2c3252' }}>Dikerjakan pada</label>
                      <div className="position-relative">
                        <FaRegCalendarAlt className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 2 }} />
                        <input type="text" className="form-control fw-semibold text-dark border rounded ps-5 py-2" value={dateRange[0].startDate && dateRange[0].endDate ? `${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}` : ''} placeholder="Pilih Rentang Tanggal" onClick={() => setShowDatePicker(!showDatePicker)} readOnly style={{ cursor: 'pointer', backgroundColor: '#fff', paddingLeft: '40px', fontSize: isWXGA ? '14px' : 'inherit' }} />
                      </div>
                      {showDatePicker && (
                        <div className="position-absolute mt-2 border shadow rounded bg-white p-3" style={{ zIndex: 1000, width: isWXGA ? 'fit-content' : 'auto', maxWidth: isWXGA ? '95vw' : 'none' }} ref={datePickerRef}>
                          {isWXGA ? (
                            <DateRange editableDateInputs={true} onChange={item => setTempDateRange([item.selection])} moveRangeOnFirstSelection={false} ranges={tempDateRange} />
                          ) : (
                            <DateRangePicker onChange={item => setTempDateRange([item.selection])} showSelectionPreview={true} moveRangeOnFirstSelection={false} months={2} ranges={tempDateRange} direction="horizontal" />
                          )}
                          <div className="d-flex justify-content-end gap-2 mt-3" style={{ flexWrap: isMobile ? "wrap" : "nowrap" }}>
                            <div style={{ flex: isMobile ? 1 : "unset" }}>
                              <button type="button" className="btn btn-outline-secondary px-4 w-100" style={{ borderRadius: "10px" }} onClick={() => { setTempDateRange(dateRange); setShowDatePicker(false); }}>Batal</button>
                            </div>
                            <div style={{ flex: isMobile ? 1 : "unset" }}>
                              <button type="button" className="btn btn-primary px-4 w-100" style={{ borderRadius: "10px" }} onClick={handleDone}>Selesai</button>
                            </div>
                          </div>
                        </div>
                      )}
                      {(dateRange[0].startDate && dateRange[0].endDate) && (
                        <div className="mt-2">
                          <button type="button" className="btn btn-link text-danger fw-medium p-0 d-inline-flex align-items-center gap-1" onClick={() => setDateRange([{ startDate: null, endDate: null, key: 'selection' }])} style={{ fontSize: 14, textDecoration: 'none' }}>
                            <FaTrashAlt size={15} className="ms-2" />
                            Hapus Rentang Tanggal
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Status Materi */}
                    <div className="mb-2">
                      <div className="fw-bold fs-5 mb-3" style={{ color: '#2c3252' }}>Status</div>
                      <div className="form-check mb-3 ms-2">
                        <input className="form-check-input" type="radio" name="statusMateri" id="statusAll" value="" checked={statusMateri === ""} onChange={() => setStatusMateri("")} />
                        <label className="form-check-label fw-bold" htmlFor="statusAll" style={{ color: statusMateri === "" ? '#2c3252' : '#a0a4b8' }}>Semua</label>
                      </div>
                      <div className="form-check mb-3 ms-2">
                        <input className="form-check-input" type="radio" name="statusMateri" id="statusBelum" value="belum" checked={statusMateri === "belum"} onChange={() => setStatusMateri("belum")} />
                        <label className="form-check-label fw-bold" htmlFor="statusBelum" style={{ color: statusMateri === "belum" ? '#2c3252' : '#a0a4b8' }}>Belum Selesai</label>
                      </div>
                      <div className="form-check ms-2">
                        <input className="form-check-input" type="radio" name="statusMateri" id="statusSudah" value="sudah" checked={statusMateri === "sudah"} onChange={() => setStatusMateri("sudah")} />
                        <label className="form-check-label fw-bold" htmlFor="statusSudah" style={{ color: statusMateri === "sudah" ? '#2c3252' : '#a0a4b8' }}>Sudah Selesai</label>
                      </div>
                    </div>
                  </div>
                </aside>
              )}
            </>
          )}
          <div className={isGuruOrAdmin ? "col-md-12" : "col-lg-9"}>
            {!isGuruOrAdmin && (
              <div className="card card-ss mb-4">
                <div className="row flex-sm-row flex-column">
                  <div className="col-sm-9 d-flex flex-column position-relative" data-joyride="cari-buku">
                    <form
                      onSubmit={e => e.preventDefault()}
                      style={{
                        position: 'relative',
                        width: searchFormWidth || '100%',
                        transition: 'width 0.2s',
                        minWidth: 0,
                      }}
                    >
                      <input
                        type="text"
                        className="form-control form-search-perpustakaan fs-5 fw-bold ms-4 pe-sm-0 pe-4"
                        placeholder="Cari Materi..."
                        name="cariMateri"
                        value={searchMateri}
                        onChange={e => setSearchMateri(e.target.value)}
                        style={{
                          width: searchInputWidth || '100%',
                          transition: 'width 0.2s',
                          minWidth: 0,
                        }}
                      />
                      {searchMateri && (
                        <span
                          style={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: `translateY(-50%) translateX(-${searchXTranslate}px)`,
                            cursor: 'pointer',
                            color: '#aaa',
                            fontSize: 20,
                            zIndex: 2,
                            padding: '6px 4px',
                            borderRadius: '50%',
                            lineHeight: 1,
                          }}
                          onClick={() => setSearchMateri("")}
                          title="Hapus pencarian"
                        >
                          &#10005;
                        </span>
                      )}
                      <button type="submit" className="d-none">Cari</button>
                    </form>
                  </div>
                  <div className="col-sm-3 d-flex justify-content-end">
                    <div className="dropdown dropdown-ss dropdown-search-perpustakaan text-sm-start text-center">
                      <div
                        className="dropdown-perpustakaan-toggle-container"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        data-joyride="dropdown-perpustakaan"
                        style={{
                          paddingTop: isMobile ? 15 : 30,
                          paddingRight: isMobile ? 20 : 40,
                          paddingBottom: isMobile ? 15 : 30,
                        }}
                      >
                        <div
                          className="dropdown-toggle dropdown-search-perpustakaan-toggle border-start border-5 border-secondary border-light-secondary-ss fw-bold color-dark pointer"
                          style={{
                            width: isMobile ? "160px" : "200px",
                            display: "inline-block",
                            textAlign: "center",
                            fontSize: isMobile ? "16px" : "1.25rem",
                            paddingLeft: isMobile ? "1rem" : "1.5rem",
                          }}
                        >
                          {muatanMateri === "produktif"
                            ? "Produktif"
                            : muatanMateri === "umum"
                              ? "Umum"
                              : "Semua Muatan"}
                        </div>
                      </div>
                      <ul className="dropdown-menu mt-2">
                        <li>
                          <a
                            className={`dropdown-item${muatanMateri === "" ? " active" : ""}`}
                            href="#"
                            onClick={e => { e.preventDefault(); setMuatanMateri(""); }}
                          >
                            Semua Muatan
                          </a>
                        </li>
                        <li>
                          <a
                            className={`dropdown-item${muatanMateri === "umum" ? " active" : ""}`}
                            href="#"
                            onClick={e => { e.preventDefault(); setMuatanMateri("umum"); }}
                          >
                            Umum
                          </a>
                        </li>
                        <li>
                          <a
                            className={`dropdown-item${muatanMateri === "produktif" ? " active" : ""}`}
                            href="#"
                            onClick={e => { e.preventDefault(); setMuatanMateri("produktif"); }}
                          >
                            Produktif
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {user?.role == "guru" && (
              <div className="card card-ss d-flex align-items-center justify-content-between my-4 w-100 bg-white p-4 rounded-3 flex-sm-row flex-column">
                <div className="mb-sm-0 mb-3">
                  <h4 className={"fw-extrabold color-dark mb-2"}>
                    Daftar Materi
                  </h4>
                  <p className="fw-semiBold align-middle align-items-center mb-0">
                    Tahun Ajaran {dataTA?.tahun} - {dataTA?.semester}
                  </p>
                </div>
                <button
                  className="btn btn-outline-primary btn-outline-primary-ss rounded-pill px-4"
                  data-bs-toggle="modal"
                  data-bs-target="#modalUbahDataTahun"
                >
                  Ubah
                </button>
              </div>
            )}
            {(nav == undefined || nav === "materi") && (
              <div
                className="g-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cardGridCols}, 1fr)`,
                  gap: '1.5rem',
                }}
              >
                {loading && <CardKelasSkeleton count={7} />}
                {filteredMateri?.length > 0 &&
                  !loading &&
                  filteredMateri?.map((d, idx) => {
                    const detail = detailMateriList.find((item) => item?.materi?.id === d.id);
                    let totalTopik = 0;
                    let topikDibaca = 0;
                    if (detail && Array.isArray(detail.bab)) {
                      totalTopik = detail.bab.reduce((acc, bab) => acc + (bab.topik?.length || 0), 0);
                      topikDibaca = detail.bab.reduce(
                        (acc, bab) =>
                          acc +
                          (bab.topik?.filter(
                            (topik) =>
                              topik?.materiKesimpulan?.waktuMulai ||
                              topik?.materiKesimpulan?.waktuSelesai
                          ).length || 0),
                        0
                      );
                      detail.bab.forEach((bab) => {
                        if (Array.isArray(bab.topik)) {
                          bab.topik.forEach((topik) => {
                            if (topik?.materiKesimpulan?.waktuSelesai || topik?.materiKesimpulan?.waktuMulai) {
                              const waktu = topik?.materiKesimpulan?.waktuSelesai || topik?.materiKesimpulan?.waktuMulai;
                              // console.log(`dibaca pada ${waktu} pada topik '${topik?.judul || ''}'`);
                            }
                          });
                        }
                      });
                    }
                    const progress = totalTopik > 0 ? Math.round((topikDibaca / totalTopik) * 100) : 0;
                    let showNewBadge = false;
                    if (detail && Array.isArray(detail.bab)) {
                      const now = new Date();
                      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                      const newTopik = detail.bab.flatMap(bab => (bab.topik || [])).filter(topik => {
                        if (!topik.createdAt) return false;
                        const created = new Date(topik.createdAt);
                        const isBaru = created >= threeDaysAgo && created <= now;
                        const sudahDibaca = topik.materiKesimpulan && (topik.materiKesimpulan.waktuMulai || topik.materiKesimpulan.waktuSelesai);
                        return isBaru && !sudahDibaca;
                      });
                      showNewBadge = newTopik.length > 0;
                    }
                    return (
                      <div key={`${idx}-${new Date().getTime()}`} data-joyride="card-materi">
                        <div className="card-kelas-ss card-materi-ss card card-ss px-2 pt-2 position-relative">
                          {showNewBadge && user?.role !== "guru" && user?.role !== "admin" && (
                            <span className="badge bg-warning text-white rounded-pill position-absolute" style={{ right: 10, top: 10, zIndex: 2 }}>
                              Topik Baru
                            </span>
                          )}
                          {(user?.role == "guru" || user?.role == "admin") && (
                            <div
                              className="rounded-circle shadow-primary-ss position-absolute pointer d-flex justify-content-center align-items-center bg-white"
                              style={{
                                right: "3%",
                                top: "6%",
                                width: "40px",
                                height: "40px",
                                zIndex: 1,
                              }}
                              onClick={() => handleDeleteMateriLainnya(d.id)}
                            >
                              <FaTrashAlt color="#fc544b" />
                            </div>
                          )}
                          <Link
                            href={`${ssURL}/materi/[id]`}
                            as={`${ssURL}/materi/${d.id}`}
                          >
                            <a className="text-decoration-none">
                              <div className="card-body card-kelas-body px-3 pt-3 justify-content-between d-flex">
                                <div className="card-kelas-name text-white">
                                  <h5 className="mb-1 fw-black">{`${d.mataPelajaran?.nama}`}</h5>
                                  <p className="m-0 fw-semibold">
                                    {user?.role === "guru"
                                      ? `Kelas ${d?.tingkat} ${d?.mataPelajaran?.kelompok == "C" ? d?.jurusan?.kode : ""}`
                                      : d?.mataPelajaran?.user?.nama}
                                  </p>
                                </div>
                              </div>
                              <div className="card-footer card-footer-ss card-kelas-footer py-3 d-flex flex-column">
                                <div className="d-flex align-items-center mb-2">
                                  <FaBook />
                                  <p className="mb-0 ms-2">{d.meta?.babCount} BAB</p>
                                  {user?.role !== "guru" && (
                                    <>
                                      <div className="label-ss bg-light-primary color-primary fs-12-ss fw-bold rounded-pill ms-2">
                                        Kelas {d?.tingkat} {d?.jurusan?.kode ? d?.jurusan?.kode : ""}
                                      </div>
                                    </>
                                  )}
                                </div>
                                
                                {dateRange[0].startDate && dateRange[0].endDate && (
                                  (() => {
                                    
                                    const detail = detailMateriList.find((item) => item?.materi?.id === d.id);
                                    if (!detail || !Array.isArray(detail.bab)) return null;
                                    const start = new Date(format(dateRange[0].startDate, 'yyyy-MM-dd'));
                                    const end = new Date(format(dateRange[0].endDate, 'yyyy-MM-dd'));
                                    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                                    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                                    let foundTopik = [];
                                    detail.bab.forEach((bab) => {
                                      if (Array.isArray(bab.topik)) {
                                        bab.topik.forEach((topik) => {
                                          if (topik.materiKesimpulan) {
                                            const waktuMulai = topik.materiKesimpulan.waktuMulai;
                                            const waktuSelesai = topik.materiKesimpulan.waktuSelesai;
                                            const waktuArr = [waktuMulai, waktuSelesai].filter(Boolean);
                                            waktuArr.forEach((waktu) => {
                                              const tgl = new Date(waktu);
                                              const tglDate = new Date(tgl.getFullYear(), tgl.getMonth(), tgl.getDate());
                                              if (tglDate >= startDate && tglDate <= endDate) {
                                                foundTopik.push(topik.judul);
                                              }
                                            });
                                          }
                                        });
                                      }
                                    });                                    
                                    foundTopik = [...new Set(foundTopik)];
                                    if (!foundTopik.length) return null;
                                    const joined = foundTopik.join(', ');
                                    const displayText = joined.length > 25 ? joined.slice(0, 25) + '...' : joined;
                                    return (
                                      <div
                                        className="d-flex align-items-center mt-1 mb-2"
                                        style={{ color: '#2c3252', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                                        title={foundTopik.join(', ')}
                                      >
                                        <FaLightbulb className="me-2" style={{ color: '#6c757d', fontSize: '1.2rem' }} />
                                        <span>{displayText}</span>
                                      </div>
                                    );
                                  })()
                                )}
                                {/* Progress Bar */}
                                {user?.role !== "guru" && user?.role !== "admin" && (
                                  totalTopik > 0 ? (
                                    <div className="d-flex align-items-center w-100">
                                      <div
                                        className="progress flex-grow-1"
                                        style={{ height: 8, borderRadius: 8, background: "#e9ecef" }}
                                      >
                                        <div
                                          className="progress-bar bg-primary"
                                          role="progressbar"
                                          style={{ width: `${progress}%`, borderRadius: 8 }}
                                          aria-valuenow={progress}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        ></div>
                                      </div>
                                      <span className="ms-3 fw-bold" style={{ minWidth: 40, color: "#2c3252" }}>
                                        {progress}%
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-muted small fst-italic">
                                      Belum ada topik pada materi ini
                                    </div>
                                  )
                                )}
                              </div>
                            </a>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            {nav === "materi-lainnya" && (
              <div className="row g-4">
                {loading && <CardKelasSkeleton count={7} />}
                {!loading && (
                  <>
                    {materiLainnya?.map((d, idx) => {
                      return (
                        <div
                          className="col-md-4"
                          key={`${idx}-${new Date().getTime()}`}
                        >
                          <div className="card-kelas-ss card-materi-ss card card-ss px-2 pt-2 dropdown dropdown-ss position-relative materi-lainnya">
                            <div className="card-body card-kelas-body px-3 pt-3 justify-content-between d-flex">
                              <Link
                                href={`${ssURL}/materi/[id]`}
                                as={`${ssURL}/materi/${d.id}`}
                              >
                                <a className="card-kelas-name text-white text-decoration-none">
                                  <h5 className="mb-1 fw-black">{`${d?.nama}`}</h5>
                                  <p className="m-0 fw-semibold">
                                    {`${d?.user?.nama} (${d?.sekolah?.nama})`}
                                  </p>
                                </a>
                              </Link>
                            </div>
                            {user?.id == d.user?.id && (
                              <div
                                className={`
                              rounded-circle shadow-primary-ss position-absolute pointer d-flex justify-content-center align-items-center bg-primary dropdown
                            `}
                                style={{
                                  right: "7%",
                                  top: "17%",
                                  width: "40px",
                                  height: "40px",
                                }}
                                role="button"
                                id={`dropdownMenuLink-${idx}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <img
                                  src="/img/icon-option-horizontal-bg-primary.svg"
                                  alt="icon-option-vertical"
                                  style={{ height: "5px" }}
                                />
                              </div>
                            )}
                            <ul
                              className="dropdown-menu dropdown-menu-ss my-1"
                              aria-labelledby={`dropdownMenuLink-${idx}`}
                            >
                              <li
                                onClick={(e) => onClickEdit(d)}
                                data-bs-toggle="modal"
                                data-bs-target="#modalTambahMateri"
                              >
                                <label className="dropdown-item">Edit</label>
                              </li>
                              <li
                                onClick={(e) => handleDeleteMateriLainnya(d.id)}
                              >
                                <a className="dropdown-item">Hapus</a>
                              </li>
                            </ul>
                            <div className="card-footer card-footer-ss card-kelas-footer py-3 d-flex">
                              <div className="color-primary d-flex align-items-center me-4">
                                <FaBook />
                                <p className="mb-0 ms-2">
                                  {d.meta?.babCount} BAB
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <ModalTambahMateri getMateriData={getMateriData} editData={editData} />
        <ModalUbahDataDashboard
          getData={getMateriData}
          semuaTA={semuaTA}
          dataTA={dataTA}
        />
      </AnimatePage>
    </Layout>
  );
};

export async function getServerSideProps({ query: { nav, m_ta_id } }) {
  return {
    props: {
      nav: nav || null,
      m_ta_id: m_ta_id || "",
    },
  };
}

export default index;