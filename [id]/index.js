import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FaBook,
  FaChevronLeft,
  FaEllipsisH,
  FaEllipsisV,
  FaLightbulb,
  FaLock,
  FaPen,
  FaPlus,
  FaQuestion,
  FaTrash,
  FaTrashAlt,
  FaSearch
} from "react-icons/fa";
import getConfig from "next/config";
import AnimatePage from "../../../../components/Shared/AnimatePage/AnimatePage";
import Layout from "../../../../components/Layout/Layout";
import NewModal from "../../../../components/Shared/NewModal/NewModal";
import ReactiveButton from "reactive-button";
import { postBab, deleteBab, editBab } from "../../../../client/BabClient";
import { getDetailMateri } from "../../../../client/MateriClient";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { useRouter } from "next/router";
import { baseURL, ssURL } from "../../../../client/clientAxios";
import { deleteTopik, postTopik } from "../../../../client/TopikClient";
import swal from "sweetalert";
import useUser from "../../../../hooks/useUser";
import { hideModal } from "../../../../utilities/ModalUtils";
import CardBabSkeleton from "../../../../components/Shared/Skeleton/CardBabSkeleton";
import MyJoyride from "../../../../components/Shared/MyJoyride/MyJoyride";

const index = ({ id }) => {
  const initialFormData = { judul: "", m_materi_id: id };
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { user } = useUser();

  const [formData, setFormData] = useState(initialFormData);

  const [buttonState, setButtonState] = useState("idle");

  const [detailMateriData, setDetailMateriData] = useState({});
  const { materi, bab } = detailMateriData;

  const getDetailMateriData = async () => {
    setLoading(true);
    const { data } = await getDetailMateri(id);
    if (data) {
      setDetailMateriData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetailMateriData();
  }, []);

  const handlePostBabData = async () => {
    const { data } = await postBab(formData);
    if (data) {
      toast.success(data?.message);
      setButtonState("success");
      setFormData(initialFormData);
      getDetailMateriData();
      hideModal("modalBab");
    } else {
      setButtonState("error");
    }
  };

  const handlePutBabData = async () => {
    const { data } = await editBab(formData?.id, formData);
    if (data) {
      toast.success(data?.message);
      setButtonState("success");
      getDetailMateriData();
      hideModal("modal-edit-bab");
    } else {
      setButtonState("error");
    }
  };

  const handleDeleteBab = async (id) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Perhatikan kembali data yang ingin anda hapus",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteBab(id);
        if (data) {
          toast.success(data?.message);
          getDetailMateriData();
        } else {
          toast.error(error?.message);
        }
      }
    });
  };

  const handlePostTopikData = async (formData) => {
    const { data, isSuccess, error } = await postTopik(formData);
    if (data) {
      router.push(`${ssURL}/bab/${formData.mBabId}?topik_id=${data.topikId}`);
    } else {
      // error?.map((err) => toast.error(err?.message));
      setButtonState("error");
    }
  };

  const handleDeleteTopikData = async (topik_id) => {
    swal({
      title: "Yakin ingin dihapus?",
      text: "Perhatikan kembali data yang ingin anda hapus",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const { data, error } = await deleteTopik(topik_id);
        if (data) {
          getDetailMateriData();
          toast.success(data?.message);
        } else {
          // error?.map((err) => toast.error(err?.message));
          setButtonState("error");
        }
      }
    });
  };

  useEffect(() => {
    getDetailMateriData();
  }, []);

  useEffect(() => {
    if (detailMateriData) {
      console.log("📦 DETAIL MATERI:", detailMateriData);
      console.log("📘 MATERI:", detailMateriData.materi);
      console.log("📚 DAFTAR BAB:", detailMateriData.bab);
    }
  }, [detailMateriData]);

  const steps = [
    {
      target: '[data-joyride="jumlah-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Jumlah BAB</h5>
          <p className="color-secondary fw-semibold">
            Banyaknya bab pada materi yang sudah anda buat.
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-joyride="button-buat-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Ingin Membuat BAB Baru?</h5>
          <p className="color-secondary fw-semibold">
            Tekan pada tombol untuk membuat BAB baru.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="judul-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">BAB Materi</h5>
          <p className="color-secondary fw-semibold">
            BAB dari topik materi yang anda buat.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="dropdown-edit-delete-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Ingin Mengedit BAB?</h5>
          <p className="color-secondary fw-semibold">
            Tekan pada tombol untuk mengedit BAB yang sudah anda buat.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="card-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Topik Materi</h5>
          <p className="color-secondary fw-semibold">
            Daftar topik pada BAB yang sudah anda buat. Tekan untuk melihat isi
            dari detail topik materi.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="dropdown-card-bab"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Ingin Mengedit Topik?</h5>
          <p className="color-secondary fw-semibold">
            Tekan pada tombol untuk mengedit topik yang sudah anda buat.
          </p>
        </div>
      ),
    },
    {
      target: '[data-joyride="btn-tambah-topik"]',
      content: (
        <div className="text-start">
          <h5 className="color-dark fw-black">Ingin Membuat Topik Baru?</h5>
          <p className="color-secondary fw-semibold">
            Tekan pada tombol untuk membuat topik baru.
          </p>
        </div>
      ),
    },
  ];

  const totalTopik = bab?.reduce((acc, curr) => acc + (curr.topik?.length || 0), 0);

  const topikDibaca = bab?.reduce(
    (acc, babItem) =>
      acc +
      (babItem.topik?.filter(
        (topik) =>
          topik?.materiKesimpulan?.waktuMulai ||
          topik?.materiKesimpulan?.waktuSelesai
      ).length || 0),
    0
  );

  const progress = totalTopik > 0 ? Math.round((topikDibaca / totalTopik) * 100) : 0;

  const [searchMateri, setSearchMateri] = useState('');

  const filteredBab = useMemo(() => {
    if (!searchMateri.trim()) return bab;
    const searchLower = searchMateri.toLowerCase();
    return bab?.map(babItem => {
      if (babItem.judul.toLowerCase().includes(searchLower)) {
        return babItem;
      }
      const filteredTopik = babItem.topik?.filter(topik => topik.judul.toLowerCase().includes(searchLower)) || [];
      if (filteredTopik.length > 0) {
        return { ...babItem, topik: filteredTopik };
      }
      return null;
    }).filter(Boolean);
  }, [bab, searchMateri]);

  return (
    <Layout
      modalWrapper={
        <>
          <NewModal
            modalId="modalBab"
            modalSize="md"
            title={
              <>
                <p className="mb-0 fw-bold">Buat BAB</p>
                <span className="fs-6">
                  Isi informasi dibawah untuk membuat BAB baru
                </span>
              </>
            }
            content={
              <>
                <h6 className="fs-18-ss fw-bold color-dark mb-4">Judul</h6>
                <input
                  required
                  className="form-control"
                  autoComplete="off"
                  placeholder="Tuliskan Judul BAB"
                  value={formData.judul}
                  onChange={({ target }) =>
                    setFormData({
                      ...formData,
                      judul: target.value,
                    })
                  }
                />
              </>
            }
            submitButton={
              <ReactiveButton
                buttonState={buttonState}
                onClick={handlePostBabData}
                color={"primary"}
                idleText={"Buat BAB Baru"}
                loadingText={"Diproses"}
                successText={"Berhasil"}
                errorText={"Gagal"}
                type={"button"}
                className={"btn btn-primary"}
              />
            }
          />
          <NewModal
            modalSize="md"
            modalId="modal-edit-bab"
            title={
              <>
                <p className="mb-0 fw-bold">Edit BAB</p>
                <span className="fs-6">
                  Isi informasi dibawah untuk membuat BAB baru
                </span>
              </>
            }
            content={
              <>
                <h6 className="fs-18-ss fw-bold color-dark mb-4">Judul</h6>
                <input
                  required
                  className="form-control"
                  autoComplete="off"
                  placeholder="Tuliskan Judul BAB"
                  value={formData.judul}
                  onChange={({ target }) =>
                    setFormData({
                      ...formData,
                      judul: target.value,
                    })
                  }
                />
              </>
            }
            submitButton={
              <ReactiveButton
                buttonState={buttonState}
                onClick={handlePutBabData}
                color={"primary"}
                idleText={"Edit BAB"}
                loadingText={"Diproses"}
                successText={"Berhasil"}
                errorText={"Gagal"}
                type={"button"}
                data-bs-dismiss="modal"
                className={"btn btn-primary"}
              />
            }
          />
        </>
      }
    >
      <MyJoyride steps={steps} />
      <AnimatePage>
        <div className="row">
          <div className="col-md-12">
            <div
              className={`${user?.role == "guru" && "d-flex justify-content-between"
                }`}
            >
              <Link href={`${ssURL}/materi`}>
                <a
                  className="text-decoration-none fw-bolder color-primary"
                  data-joyride="button-daftar-materi"
                >
                  <FaChevronLeft />
                  <span className="ms-2">Daftar Materi</span>
                </a>
              </Link>
            </div>

            <div className="card-header-kelas-ss card card-kelas-ss card-ss px-0 mt-3">
              <div className="card-body px-4 pt-3 pb-5 justify-content-between d-flex mb-md-0 mb-3">
                <div className="card-kelas-name text-white">
                  <h2 className="mb-2 fw-black" data-joyride="judul-materi">
                    {materi?.sekolah
                      ? materi?.nama
                      : materi?.mataPelajaran?.nama}
                  </h2>
                  <p
                    className="m-0 fw-semibold fs-18-ss"
                    data-joyride="sub-judul-materi"
                  >
                    {materi?.sekolah
                      ? `${materi?.user?.nama || ""} (${materi?.sekolah?.nama || ""
                      })`
                      : `Kelas ${materi?.tingkat || ""} ${(materi?.jurusan && materi?.jurusan?.kode) || ""
                      }`}
                  </p>
                </div>
              </div>
              <div className="card-footer card-footer-ss card-kelas-footer py-0 px-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center align-items-stretch">
                <div className="kelas-nav d-flex flex-column flex-lg-row flex-lg-fill align-items-stretch gap-3">
                  {/* BAB Section */}
                  <div
                    className="color-primary d-flex align-items-center flex-shrink-0"
                    data-joyride="jumlah-bab"
                  >
                    <div
                      className="rounded-circle bg-light-primary d-flex justify-content-center align-items-center me-2 fs-4"
                      style={{ height: "35px", width: "35px" }}
                    >
                      <FaBook />
                    </div>
                    <p className="mb-0 fs-18-ss fw-bold">{bab?.length || 0} BAB</p>
                  </div>

                  {/* Progress Section: hanya untuk siswa/murid (bukan guru/admin) jika ada topik */}
                  {(user?.role !== "guru" && user?.role !== "admin") && (
                    <div className="text-primary d-flex justify-content-center flex-column flex-fill min-width-0 ms-2 ms-lg-4">
                      {totalTopik > 0 && (
                        <>
                          <div className="d-flex align-items-center flex-wrap gap-3 fw-bold">
                            <div className="d-flex align-items-center">
                              <FaLightbulb />
                              <p className="mb-0 ms-2 text-nowrap">{totalTopik} Topik</p>
                            </div>
                            <div>
                              -
                            </div>
                            <div className="d-flex align-items-center">
                              <p className="mb-0 text-nowrap">{topikDibaca} Selesai Dibaca</p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center w-100">
                            <div
                              className="progress flex-grow-1"
                              style={{ height: 8, borderRadius: 8, background: '#e9ecef', width: '100%', maxWidth: '300px' }}
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
                            <span className="ms-3 fw-bold text-nowrap" style={{ minWidth: 40, color: '#2c3252' }}>
                              {progress}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Search Form */}
                  <div
                    className={`d-flex align-items-center ${user?.role !== "guru" && user?.role !== "admin" ? 'ms-lg-auto' : 'flex-shrink-0'}`}
                    style={{ minWidth: '250px' }}
                  >
                    <form onSubmit={e => e.preventDefault()} className="w-100">
                      <input
                        type="text"
                        className="form-control form-search-perpustakaan fw-bold w-100 ms-2 ms-sm-3 ms-lg-4 pe-3 pe-sm-2 pe-lg-4 fs-6 fs-sm-5"
                        placeholder="Cari Materi..."
                        name="cariMateri"
                        value={searchMateri}
                        onChange={e => setSearchMateri(e.target.value)}
                        style={{
                          minHeight: '45px',
                          maxWidth: '100%',
                        }}
                      />

                      <button type="submit" className="d-none">Cari</button>
                    </form>
                  </div>
                </div>

                {user?.role == "guru" &&
                  (!materi?.sekolah || user?.id === materi?.user?.id) && (
                    <div className="d-flex justify-content-center justify-content-md-end">
                      <button
                        className="btn btn-ss btn-primary bg-gradient-primary shadow-primary-ss rounded-pill fs-14-ss fw-bolder py-1 px-3 mb-3 mb-md-0 d-flex align-items-center"
                        data-bs-toggle="modal"
                        data-bs-target="#modalBab"
                        onClick={() => setFormData(initialFormData)}
                        data-joyride="button-buat-bab"
                      >
                        <FaPlus />
                        <span className="ms-2">Buat BAB</span>
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <CardBabSkeleton count={8} />
        ) : (
          <>
            {!filteredBab?.length && (
              <>
                <div className="row justify-content-center mt-5">
                  <div className="col-md-4 col-8 mb-3">
                    <img
                      src="/img/empty-state-buku.png"
                      alt="empty-state"
                      className="img-fluid"
                    />
                  </div>
                  <div className="col-12 text-center">
                    <h4 className="fw-black color-dark mb-2">
                      {searchMateri
                        ? "Tidak Ada Materi yang Cocok"
                        : "Belum Ada Materi Yang Dibuat"}
                    </h4>
                    {!searchMateri && (
                      <p className="fw-bold">
                        Tekan tombol {""}
                        <span
                          className="color-primary pointer"
                          data-bs-toggle="modal"
                          data-bs-target="#modalBab"
                          onClick={() => setFormData(initialFormData)}
                        >
                          Buat BAB
                        </span>
                        {""} untuk membuat materi
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
            {filteredBab?.map((d, idx) => {
              const originalIndex = bab?.findIndex(b => b.id === d.id) + 1;
              return (
                <div key={d.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6
                      className="fw-black fs-18-ss my-4 color-dark"
                      data-joyride="judul-bab"
                    >
                      BAB {originalIndex} - {d.judul}
                    </h6>
                    {user?.role === "guru" &&
                      (!materi?.sekolah || user?.id === materi?.user?.id) && (
                        <div
                          className="dropdown dropdown-ss"
                          data-joyride="dropdown-edit-delete-bab"
                        >
                          <div
                            role="button"
                            id="dropdownEditDeleteBab"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <img
                              src="/img/icon-option-vertical.svg"
                              alt="icon-option"
                            />
                          </div>
                          <ul
                            className="dropdown-menu dropdown-menu-ss my-1"
                            aria-labelledby="dropdownEditDeleteBab"
                          >
                            <li
                              className="d-flex align-items-center"
                              onClick={() =>
                                setFormData({ judul: d.judul, id: d.id })
                              }
                            >
                              <a
                                className="dropdown-item color-secondary"
                                data-bs-toggle="modal"
                                data-bs-target="#modal-edit-bab"
                              >
                                <FaPen /> Edit
                              </a>
                            </li>
                            <li onClick={() => handleDeleteBab(d.id)}>
                              <a className="dropdown-item color-danger">
                                <FaTrashAlt /> Hapus
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                  </div>
                  <div className="row g-4">
                    {d.topik?.length ? (
                      <>
                        {d.topik?.map((e, idx) => {
                          // New logic: use lock and materiKesimpulan
                          const isLocked = !!e.lock;
                          const isNew = !isLocked && !e.materiKesimpulan;
                          const isOpened = !isLocked && !!e.materiKesimpulan;

                          return (
                            <div className="col-md-3" key={`${idx}-${e.id}`}>
                              {user?.role === "siswa" && isLocked ? (
                                <a className="text-decoration-none">
                                  <div className="card-detail-materi position-relative shadow-dark-ss">
                                    <span className="circle bg-secondary shadow-secondary-ss">
                                      <FaLock />
                                    </span>
                                    <p className="text-secondary fw-semibold">{e.judul}</p>
                                  </div>
                                </a>
                              ) : (
                                <a className="text-decoration-none">
                                  <div
                                    className="card-detail-materi position-relative shadow-dark-ss"
                                    data-joyride="card-bab"
                                  >
                                    <div className="dropdown dropdown-ss">
                                      {user?.role === "guru" &&
                                        (!materi?.sekolah || user?.id === materi?.user?.id) && (
                                          <>
                                            <div
                                              className="position-absolute ellipsis-h m-0"
                                              role="button"
                                              id="dropdownMenuLink-0"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false"
                                              data-joyride="dropdown-card-bab"
                                            >
                                              <img
                                                src={`/img/icon-dropdown-option.svg`}
                                                alt="icon-option"
                                              />
                                            </div>
                                            <ul
                                              className="dropdown-menu dropdown-menu-ss my-1"
                                              aria-labelledby="dropdownMenuLink-0"
                                            >
                                              <li className="d-flex align-items-center">
                                                <a className="dropdown-item color-secondary">
                                                  <FaPen /> Edit
                                                </a>
                                              </li>
                                              <li>
                                                <a
                                                  className="dropdown-item color-danger"
                                                  onClick={() => handleDeleteTopikData(e.id)}
                                                >
                                                  <FaTrashAlt /> Hapus
                                                </a>
                                              </li>
                                            </ul>
                                          </>
                                        )}
                                    </div>
                                    <Link
                                      href={`${ssURL}/bab/[id]?topik_id=${e.id}`}
                                      as={`${ssURL}/bab/${d.id}?topik_id=${e.id}`}
                                    >
                                      <a className="position-relative">
                                        <span className="circle shadow-primary-ss">
                                          {e.kuis ? <FaQuestion /> : <FaLightbulb />}
                                        </span>
                                        <p className="text-secondary fw-semibold mb-1">{e.judul}</p>

                                        <div className="d-flex gap-2 mt-2">
                                          {isOpened && (
                                            <span className="badge bg-soft-success text-success rounded-pill px-3 py-2 small">
                                              <i className="fas fa-check-circle"></i>
                                              Selesai
                                            </span>
                                          )}
                                          {isNew && user?.role === "siswa" && (
                                            <span className="badge bg-soft-warning color-warning rounded-pill px-3 py-2 small">
                                              <i className="fas fa-sparkles"></i>
                                              Baru
                                            </span>
                                          )}
                                        </div>
                                      </a>
                                    </Link>
                                  </div>
                                </a>
                              )}
                            </div>
                          );
                        })}

                        {user?.role === "guru" &&
                          (!materi?.sekolah || user?.id === materi?.user?.id) && (
                            <div className="col-md-3">
                              <div
                                className="card-detail-materi position-relative tambah-bab"
                                data-joyride="btn-tambah-topik"
                              >
                                <div className="dropdown dropdown-ss">
                                  <div
                                    role="button"
                                    id="dropdownMenuLink-0"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <a className="text-decoration-none">
                                      <div className="plus">
                                        <FaPlus className="text-white" />
                                      </div>
                                    </a>
                                  </div>
                                  <ul
                                    className="dropdown-menu dropdown-menu-ss my-1"
                                    aria-labelledby="dropdownMenuLink-0"
                                  >
                                    <li className="d-flex align-items-center">
                                      <a
                                        className="dropdown-item text-secondary"
                                        onClick={() =>
                                          handlePostTopikData({
                                            mBabId: d.id,
                                            kuis: 0,
                                          })
                                        }
                                      >
                                        Topik
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      user?.role === "guru" &&
                      (!materi?.sekolah || user?.id === materi?.user?.id) && (
                        <div className="col-md-3">
                          <a
                            className="text-decoration-none"
                            data-joyride="btn-tambah-topik"
                          >
                            <div className="card-detail-materi position-relative tambah-bab">
                              <div className="plus">
                                <div className="dropdown dropdown-ss">
                                  <div
                                    role="button"
                                    id="dropdownMenuLink-0"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <FaPlus className="text-white" />
                                  </div>
                                  <ul
                                    className="dropdown-menu dropdown-menu-ss my-1"
                                    aria-labelledby="dropdownMenuLink-0"
                                  >
                                    <li className="d-flex align-items-center">
                                      <a
                                        className="dropdown-item text-secondary"
                                        onClick={() =>
                                          handlePostTopikData({
                                            mBabId: d.id,
                                            kuis: 0,
                                          })
                                        }
                                      >
                                        Topik
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </AnimatePage>
    </Layout>
  );
};

export async function getServerSideProps({ params: { id } }) {
  return {
    props: {
      id,
    },
  };
}

export default index;