/* 태평양 섬나라 문학 데이터: 파푸아뉴기니, 사모아, 통가 (data-jp.js와 같은 형식)
   t 한국어 제목(국내 번역본 제목을 알라딘에서 확인) · o 원제 · a 작가(국내판 표기) · ao 원어 이름 · y 기준 연도 · yl 표기용 시기
   nt: true = 국내 미출간(제목은 원제를 우리말로 옮김)
   통가 출신으로 피지에서 활동한 에펠리 하우오파는 통가에 넣었다. */
window.ATLAS = window.ATLAS || { countries: {} };

/* ───────── 파푸아뉴기니 ───────── */
window.ATLAS.countries.pg = {
  code: "pg",
  geoId: "598",
  name: "파푸아뉴기니",
  nameEn: "Papua New Guinea",
  native: "Papua Niugini",
  fit: [[140.8, -11.8], [156.0, -1.0]],
  badge: [145.5, -6.3],
  badgeSide: "r",
  intro:
    "800개가 넘는 언어가 쓰이는 섬나라로, 오스트레일리아의 통치를 받다 1975년 독립했다. 독립을 앞두고 포트모르즈비의 대학에서 파푸아뉴기니 사람들이 처음 영어로 소설과 희곡을 쓰기 시작했다.",

  periods: [
    { id: "independence", name: "독립 전후", sub: "첫 소설의 세대", jp: "Independence", start: 1965, end: 2026,
      text: "1966년 파푸아뉴기니 대학이 문을 연 뒤 학생 작가들이 식민 지배와 마을의 전통, 도시로 나온 젊은이들의 혼란을 썼다. 1975년 독립했고, 1990년대에는 부건빌 내전을 겪었다.",
      tags: ["식민 지배", "독립", "마을과 도시", "주술"] }
  ],

  events: [
    { id: "independence", name: "파푸아뉴기니 독립", start: 1975, end: 1975, win: false,
      desc: "1975년 9월 16일 오스트레일리아의 통치가 끝나고 파푸아뉴기니가 독립했다.",
      about: ["wanpis"] }
  ],

  regions: [
    { id: "gulf", ic: "palm", side: "l", name: "걸프 지방(파푸아만)", ll: [145.5, -7.9] },
    { id: "moresby", ic: "anchor", side: "r", name: "포트모르즈비", ll: [147.18, -9.44] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],

  books: [
    { id: "crocodile", t: "악어", o: "The Crocodile", a: "빈센트 에리", ao: "Vincent Eri", y: 1970, yl: "1970년", g: "장편 소설", r: ["gulf"], nt: true,
      s: "식민지 파푸아의 바닷가 마을 소년 호이리가 학교에 다니고 백인 정부의 일꾼이 되어 제2차 세계대전을 겪는다. 그사이 아내가 악어에게 목숨을 잃는데, 마을 사람들은 주술 때문이라 믿는다.",
      h: "파푸아뉴기니 사람이 쓴 첫 장편 소설. 작가는 뒤에 총독이 되었다.",
      k: ["식민지", "주술", "악어", "첫 소설"] },
    { id: "wanpis", t: "외톨이", o: "Wanpis", a: "러셀 소아바", ao: "Russell Soaba", y: 1977, yl: "1977년", g: "장편 소설", r: ["moresby"], nt: true,
      s: "독립 무렵 포트모르즈비의 대학가에서, 고향 마을과 도시 어디에도 속하지 못한 젊은이들이 방황한다.",
      h: "제목은 ‘외톨이’를 뜻하는 톡피신어(파푸아뉴기니 공용어)에서 왔다.",
      k: ["방황", "대학가", "정체성", "독립"] }
  ]
};

/* ───────── 사모아 ───────── */
window.ATLAS.countries.ws = {
  code: "ws",
  geoId: "882",
  name: "사모아",
  nameEn: "Samoa",
  native: "Sāmoa",
  fit: [[-172.9, -14.2], [-171.3, -13.3]],
  badge: [-172.1, -13.75],
  badgeSide: "r",
  intro:
    "폴리네시아의 섬나라로, 독일과 뉴질랜드의 통치를 거쳐 1962년 태평양 섬나라 가운데 가장 먼저 독립했다. 마을 공동체와 족장 제도 ‘파아 사모아’가 삶의 중심이며, 앨버트 웬트가 태평양 문학을 열었다.",

  periods: [
    { id: "modern", name: "독립 이후", sub: "마을과 족장", jp: "Fa'a Sāmoa", start: 1962, end: 2026,
      text: "작가들은 족장 제도와 교회, 돈이 바꿔 놓은 마을, ‘나’보다 ‘우리’가 앞서는 공동체 속에서 자라는 아이들을 그렸다.",
      tags: ["족장 제도", "교회", "공동체", "근대화"] }
  ],

  events: [
    { id: "independence", name: "사모아 독립", start: 1962, end: 1962, win: false,
      desc: "1962년 1월 1일 서사모아가 뉴질랜드의 신탁 통치에서 벗어나 태평양 섬나라 가운데 처음으로 독립했다.",
      about: ["banyan"] }
  ],

  regions: [
    { id: "village", ic: "palm", side: "r", name: "우폴루섬 마을", ll: [-171.76, -13.9] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],

  books: [
    { id: "banyan", t: "반얀나무의 잎", o: "Leaves of the Banyan Tree", a: "앨버트 웬트", ao: "Albert Wendt", y: 1979, yl: "1979년", g: "장편 소설", r: ["village"], nt: true,
      s: "서사모아의 한 마을에서 야심 찬 족장 타우일로페페가 교회와 돈을 이용해 부를 쌓고, 아들과 손자 세대는 식민지 근대화 속에서 저마다 다른 길을 간다.",
      h: "태평양 문학의 아버지로 불리는 웬트의 대표작으로, 세 세대에 걸친 사모아 가족 이야기다.",
      k: ["족장", "세 세대", "돈과 교회", "근대화"] },
    { id: "belonged", t: "우리가 속했던 곳", o: "Where We Once Belonged", a: "시아 피겔", ao: "Sia Figiel", y: 1996, yl: "1996년", g: "장편 소설", r: ["village"], nt: true,
      s: "사모아 마을의 소녀 알라파오가 ‘나’보다 ‘우리’가 중요한 공동체 속에서 성과 폭력, 가족의 규범에 부딪히며 자라난다.",
      h: "1997년 영연방 작가상(동남아시아·남태평양 첫 책 부문)을 받았다. 사모아의 이야기 전통을 소설에 끌어들였다.",
      k: ["소녀", "공동체", "성장", "이야기 전통"] }
  ]
};

/* ───────── 통가 ───────── */
window.ATLAS.countries.to = {
  code: "to",
  geoId: "776",
  name: "통가",
  nameEn: "Tonga",
  native: "Tonga",
  fit: [[-176.0, -22.0], [-173.5, -18.5]],
  badge: [-175.1, -21.1],
  badgeSide: "r",
  intro:
    "태평양에서 유일하게 한 번도 식민지가 되지 않은 왕국이다. 통가 출신 인류학자이자 작가 에펠리 하우오파는 개발 원조와 서구 문물에 휩쓸리는 태평양 사회를 유머로 풍자했고, 태평양을 ‘섬들의 바다’로 다시 보자고 주장했다.",

  periods: [
    { id: "modern", name: "현대 통가", sub: "웃음의 풍자", jp: "Pule'anga Tonga", start: 1970, end: 2026,
      text: "1970년 영국의 보호령에서 완전히 벗어난 뒤 개발 원조와 이민, 교회가 사회를 바꿨다. 하우오파는 그 변화를 우스꽝스러운 이야기로 그렸다.",
      tags: ["왕국", "개발 원조", "풍자", "섬들의 바다"] }
  ],

  events: [
    { id: "protectorate", name: "영국 보호령의 종료", start: 1970, end: 1970, win: false,
      desc: "1900년부터 영국의 보호령이던 통가는 1970년 완전한 주권을 되찾아 영연방에 가입했다.",
      about: ["tikongs"] }
  ],

  regions: [
    { id: "tongatapu", ic: "palm", side: "r", name: "통가타푸섬", ll: [-175.2, -21.15] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],

  books: [
    { id: "tikongs", t: "티콩 이야기", o: "Tales of the Tikongs", a: "에펠리 하우오파", ao: "Epeli Hau'ofa", y: 1983, yl: "1983년", g: "연작 단편", r: ["tongatapu"], nt: true,
      s: "가상의 섬나라 티코에서 개발 원조와 관료, 교회가 엉터리로 돌아가는 모습을 풍자한 연작 단편.",
      h: "통가를 본뜬 섬나라를 무대로 한 하우오파의 첫 소설집.",
      k: ["개발 원조", "관료", "교회", "풍자"] },
    { id: "kisses", t: "엉덩이에 입맞춤을", o: "Kisses in the Nederends", a: "에펠리 하우오파", ao: "Epeli Hau'ofa", y: 1987, yl: "1987년", g: "장편 소설", r: ["none"],
      s: "태평양 섬나라의 중년 남자 오일레이가 엉덩이에 생긴 지독한 통증을 고치려고 주술사와 의사, 마사지사를 전전하며 우스꽝스러운 소동을 벌인다.",
      h: "서구 의학과 전통 치료, 태평양 사회를 거침없이 풍자한 소설.",
      k: ["엉덩이 통증", "치료", "풍자", "유머"] }
  ]
};
