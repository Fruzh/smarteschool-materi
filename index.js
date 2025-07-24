import Link from "next/link";
import Layout from "../../../components/Layout/Layout";
import AnimatePage from "../../../components/Shared/AnimatePage/AnimatePage";
import getConfig from "next/config";
import { FaBook, FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
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
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

const index = ({ nav, m_ta_id }) => {
  const { joyrideConfig, setJoyrideConfig } = useJoyride();
  const { pathname } = useRouter();
  const { ta } = useTa();
  const [tipeTa, setTipeTA] = useState({ value: m_ta_id });
  const { user } = useUser();
  const [searchMateri, setSearchMateri] = useState("");
  const [statusMateri, setStatusMateri] = useState("");
  const [muatanMateri, setMuatanMateri] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [tempDateRange, setTempDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [materiData, setMateriData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  // State untuk progress per materi
  const [progressMap, setProgressMap] = useState({});
  const { materi, materiLainnya, semuaTA, dataTA } = materiData;
  const datePickerRef = useRef(null);

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

  const getMateriData = async () => {
    setLoading(true);
    const { data } = await getMateri({ m_ta_id: tipeTa?.value || ta.id });
    if (data) {
      setMateriData(data);
      // Setelah data materi didapat, fetch detail untuk progress
      if (data.materi && Array.isArray(data.materi)) {
        // Ambil detail semua materi secara paralel
        const detailPromises = data.materi.map((m) => getDetailMateri(m.id));
        const detailResults = await Promise.all(detailPromises);
        // Hitung progress per materi
        const newProgressMap = {};
        detailResults.forEach((res, idx) => {
          const detail = res?.data;
          if (detail && Array.isArray(detail.bab)) {
            const totalTopik = detail.bab.reduce((acc, bab) => acc + (bab.topik?.length || 0), 0);
            const totalTopikSelesai = detail.bab.reduce((acc, bab) => {
              const selesai = (bab.topik || []).filter(
                (topik) => topik.materiKesimpulan && topik.materiKesimpulan.dibaca === 1
              ).length;
              return acc + selesai;
            }, 0);
            const progress = totalTopik === 0 ? 0 : Math.round((totalTopikSelesai / totalTopik) * 100);
            newProgressMap[data.materi[idx].id] = progress;
          } else {
            newProgressMap[data.materi[idx].id] = 0;
          }
        });
        setProgressMap(newProgressMap);
      }
      setLoading(false);
    }
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
        setTempDateRange(dateRange); // Revert to previous saved dates
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
      filteredMateri = filteredMateri.filter((d) =>
        statusMateri === "sudah"
          ? d.status === "sudah"
          : d.status === "belum"
      );
    }
    if (dateRange[0].startDate) {
      filteredMateri = filteredMateri.filter((d) =>
        d.tanggal && d.tanggal >= format(dateRange[0].startDate, 'yyyy-MM-dd')
      );
    }
    if (dateRange[0].endDate) {
      filteredMateri = filteredMateri.filter((d) =>
        d.tanggal && d.tanggal <= format(dateRange[0].endDate, 'yyyy-MM-dd')
      );
    }
  }

  useEffect(() => {
    if (materiData) {
      console.log("ISI STATE materiData:", materiData);
    }
  }, [materiData]);

  return (
    <Layout>
      <MyJoyride steps={steps} />
      <AnimatePage>
        <div className="row">
          {!isGuruOrAdmin && (
            <aside className="col-lg-3 mb-4">
              <div className="card card-ss p-4" style={{ borderRadius: 24, minHeight: 300 }}>
                <div className="mb-4">
                  <div className="fw-bold fs-4 mb-3" style={{ color: '#2c3252' }}>Status</div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="statusMateri"
                      id="statusAll"
                      value=""
                      checked={statusMateri === ""}
                      onChange={() => setStatusMateri("")}
                    />
                    <label className="form-check-label fw-bold" htmlFor="statusAll" style={{ color: statusMateri === "" ? '#2c3252' : '#a0a4b8' }}>
                      Semua
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="statusMateri"
                      id="statusBelum"
                      value="belum"
                      checked={statusMateri === "belum"}
                      onChange={() => setStatusMateri("belum")}
                    />
                    <label className="form-check-label fw-bold" htmlFor="statusBelum" style={{ color: statusMateri === "belum" ? '#2c3252' : '#a0a4b8' }}>
                      Belum Selesai
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="statusMateri"
                      id="statusSudah"
                      value="sudah"
                      checked={statusMateri === "sudah"}
                      onChange={() => setStatusMateri("sudah")}
                    />
                    <label className="form-check-label fw-bold" htmlFor="statusSudah" style={{ color: statusMateri === "sudah" ? '#2c3252' : '#a0a4b8' }}>
                      Sudah Selesai
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="fw-bold fs-4 mb-2" style={{ color: '#2c3252' }}>Pilih Tanggal</div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control fw-bold"
                      value={dateRange[0].startDate && dateRange[0].endDate
                        ? `${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`
                        : 'Pilih Rentang Tanggal'}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  {showDatePicker && (
                    <div className="position-absolute" style={{ zIndex: 1000 }} ref={datePickerRef}>
                      <DateRangePicker
                        onChange={item => setTempDateRange([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={tempDateRange}
                        direction="horizontal"
                      />
                      <div className="d-flex justify-content-end mt-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleDone}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                  {(dateRange[0].startDate || dateRange[0].endDate) && (
                    <button
                      type="button"
                      className="btn btn-link p-0 mt-2"
                      onClick={() => setDateRange([{ startDate: null, endDate: null, key: 'selection' }])}
                      style={{ fontSize: 13 }}
                    >
                      Hapus Range Tanggal
                    </button>
                  )}
                </div>
              </div>
            </aside>
          )}
          <div className={isGuruOrAdmin ? "col-md-12" : "col-lg-9"}>
            {!isGuruOrAdmin && (
              <div className="card card-ss mb-4">
                <div className="row flex-sm-row flex-column">
                  <div className="col-sm-9 d-flex flex-column" data-joyride="cari-buku">
                    <form onSubmit={e => e.preventDefault()}>
                      <input
                        type="text"
                        className="form-control form-search-perpustakaan fs-5 fw-bold ms-4 pe-sm-0 pe-4"
                        placeholder="Cari Materi..."
                        name="cariMateri"
                        value={searchMateri}
                        onChange={e => setSearchMateri(e.target.value)}
                      />
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
                        style={{ paddingTop: 30, paddingRight: 40, paddingBottom: 30 }}
                      >
                        <div className="dropdown-toggle dropdown-search-perpustakaan-toggle border-start border-5 border-secondary border-light-secondary-ss ps-4 fs-5 fw-bold color-dark pointer"
                          style={{ width: "200px", display: "inline-block", textAlign: "center" }}
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
              <div className="row g-4">
                {loading && <CardKelasSkeleton count={7} />}
                {filteredMateri?.length ? (
                  <>
                    {!loading &&
                      filteredMateri?.map((d, idx) => {
                        return (
                          <div
                            className="col-md-4"
                            key={`${idx}-${new Date().getTime()}`}
                            data-joyride="card-materi"
                          >
                            <div className="card-kelas-ss card-materi-ss card card-ss px-2 pt-2">
                              {(user?.role == "guru" ||
                                user?.role == "admin") && (
                                  <div
                                    className="rounded-circle shadow-primary-ss position-absolute pointer d-flex justify-content-center align-items-center bg-white"
                                    style={{
                                      right: "3%",
                                      top: "6%",
                                      width: "40px",
                                      height: "40px",
                                      zIndex: 1,
                                    }}
                                    onClick={() =>
                                      handleDeleteMateriLainnya(d.id)
                                    }
                                  >
                                    <FaTrashAlt color={"#fc544b"} />
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
                                          ? `Kelas ${d?.tingkat} ${d?.mataPelajaran?.kelompok == "C"
                                            ? d?.jurusan?.kode
                                            : ""
                                          }`
                                          : d?.mataPelajaran?.user?.nama}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="card-footer card-footer-ss card-kelas-footer py-3 d-flex flex-column">
                                    <div className="d-flex align-items-center mb-2">
                                      <FaBook />
                                      <p className="mb-0 ms-2">
                                        {d.meta?.babCount} BAB
                                      </p>
                                      {user?.role !== "guru" && (
                                        <div className="label-ss bg-light-primary color-primary fs-12-ss fw-bold rounded-pill ms-2">
                                          Kelas {d?.tingkat}{" "}
                                          {d?.jurusan?.kode
                                            ? d?.jurusan?.kode
                                            : ""}
                                        </div>
                                      )}
                                    </div>
                                    {/* Progress bar: progress belajar siswa (berdasarkan topik dibaca) */}
                                    {(() => {
                                      const progress = progressMap[d.id] ?? 0;
                                      return (
                                        <div className="d-flex align-items-center w-100">
                                          <div className="progress flex-grow-1" style={{ height: 8, borderRadius: 8, background: '#e9ecef' }}>
                                            <div
                                              className="progress-bar bg-primary"
                                              role="progressbar"
                                              style={{ width: `${progress}%`, borderRadius: 8 }}
                                              aria-valuenow={progress}
                                              aria-valuemin="0"
                                              aria-valuemax="100"
                                            ></div>
                                          </div>
                                          <span className="ms-3 fw-bold" style={{ minWidth: 40, color: '#2c3252' }}>{progress}%</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </a>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <div className="h-auto">
                    <Empty />
                  </div>
                )}
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