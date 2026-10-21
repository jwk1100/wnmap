/* 벨리즈 문학 데이터 (data-jp.js와 같은 형식)
   t 한국어 제목(국내 번역본 제목을 알라딘에서 확인) · o 원제 · a 작가 · ao 원어 이름 · y 기준 연도 · yl 표기용 시기
   nt: true = 국내 미출간(제목은 원제를 우리말로 옮김) */
window.ATLAS = window.ATLAS || { countries: {} };

window.ATLAS.countries.bz = {
  code: "bz",
  geoId: "084",
  name: "벨리즈",
  nameEn: "Belize",
  native: "Belize",
  fit: [[-89.3, 15.8], [-87.4, 18.6]],
  badge: [-88.7, 17.2],
  badgeSide: "r",
  intro:
    "중앙아메리카에서 유일하게 영어를 공용어로 쓰는 나라로, 1981년 영국에서 독립했다. 크리올, 메스티소, 마야, 아프리카계 가리푸나 사람들이 함께 사는 작은 나라의 문학은 독립과 정체성, 여성의 삶을 그린 젤마 에젤의 소설에서 본격적으로 시작되었다.",

  periods: [
    { id: "independence", name: "독립 전후", sub: "작은 나라의 목소리", jp: "Independence era", start: 1950, end: 2026,
      text: "1950년대 독립 운동이 시작되어 1981년 영국령 온두라스가 벨리즈로 독립했다. 작가들은 식민지의 기억과 크리올·가리푸나 공동체의 삶, 여성의 성장을 영어와 크리올어로 썼다.",
      tags: ["독립", "크리올", "가리푸나", "여성 작가"] }
  ],

  events: [
    { id: "independencia", name: "독립 운동과 독립", start: 1950, end: 1981, win: false,
      desc: "1950년 인민연합당이 결성되어 자치를 요구했고, 1981년 9월 21일 영국령 온두라스가 벨리즈로 독립했다.",
      about: ["beka", "blues"] }
  ],

  regions: [
    { id: "belizecity", ic: "lighthouse", side: "r", name: "벨리즈시티", ll: [-88.2, 17.5] },
    { id: "south", ic: "djembe", side: "r", name: "남부(가리푸나 마을)", ll: [-88.25, 16.95] },
    { id: "abroad", name: "해외 배경", ll: null },
    { id: "none", name: "특정 지역 없음", ll: null }
  ],

  books: [
    { id: "blues", t: "노스 아메리카 블루스", o: "North Amerikkkan Blues", a: "에번 X 하이드", ao: "Evan X Hyde", y: 1971, yl: "1971년", g: "산문", r: ["belizecity", "abroad"], nt: true,
      s: "미국 대학에서 흑인 민권 운동을 겪고 돌아온 벨리즈 청년이 인종과 식민주의, 흑인의 자긍심에 대해 쓴 글.",
      h: "벨리즈 흑인 의식 운동을 이끈 언론인의 대표작.",
      k: ["흑인 의식", "식민주의", "민권 운동", "청년"] },
    { id: "beka", t: "베카 램", o: "Beka Lamb", a: "젤마 에젤", ao: "Zee Edgell", y: 1982, yl: "1982년", g: "장편 소설", r: ["belizecity"], nt: true,
      s: "1950년대 독립 운동이 움트던 벨리즈시티, 열네 살 크리올 소녀 베카가 임신한 채 버림받고 세상을 떠난 친구 토이시를 애도하며 학교와 가족, 정치 속에서 자란다.",
      h: "벨리즈 소설로는 처음 국제적으로 알려진 작품으로, 영국 포셋 소사이어티 도서상을 받았다.",
      k: ["성장", "독립 운동", "크리올", "여성"] },
    { id: "heroes", t: "영웅과 도마뱀과 열정에 대하여", o: "On Heroes, Lizards and Passion", a: "조일라 엘리스", ao: "Zoila Ellis", y: 1988, yl: "1988년", g: "단편집", r: ["south"], nt: true,
      s: "가리푸나 마을과 벨리즈의 시골에서, 전통과 근대, 사랑과 이주 사이에서 흔들리는 사람들의 이야기.",
      h: "가리푸나 출신 여성 작가의 단편집으로, 벨리즈 다문화 문학의 대표작.",
      k: ["가리푸나", "전통", "여성", "단편"] },
    { id: "timeriver", t: "시간과 강", o: "Time and the River", a: "젤마 에젤", ao: "Zee Edgell", y: 2007, yl: "2007년", g: "역사 소설", r: ["belizecity"], nt: true,
      s: "18세기 말 영국 벌목업자들의 정착지에서, 한 노예 여성이 마호가니 벌목과 노예제, 스페인의 공격 속에서 자유를 향해 살아간다.",
      h: "벨리즈 노예제의 역사를 여성의 시선으로 그린 에젤의 마지막 장편.",
      k: ["노예제", "마호가니 벌목", "역사 소설", "여성"] }
  ]
};
