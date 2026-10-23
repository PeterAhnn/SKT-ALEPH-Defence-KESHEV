// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('div');

      const appendText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const modeText = (resource) => {
        if (resource?.mode === 'demo') return '예제 자료';
        if (resource?.mode === 'disconnected') return '연결 없음';
        if (resource?.mode === 'unknown') return '확인 불가';
        return null;
      };
      const appendMode = (parent, resource) => {
        const label = modeText(resource);
        if (label) appendText(parent, 'p', `연결 모드: ${label}`);
      };
      const statusText = (kind, value) => {
        const labels = kind === 'device'
          ? { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' }
          : { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
        return `${labels[value] || '확인 불가'} (${String(value ?? 'unknown')})`;
      };
      const errorText = (resource) => {
        const message = typeof resource?.error?.message === 'string'
          ? resource.error.message
          : '서버가 오류 메시지를 제공하지 않았습니다.';
        const code = resource?.error?.code;
        const label = code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED'
          ? '확인 불가'
          : '연결 실패';
        return `${label}: ${message}`;
      };
      const section = (title, resource) => {
        const panel = document.createElement('section');
        appendText(panel, 'h3', title);
        appendMode(panel, resource);
        root.append(panel);
        return panel;
      };
      const renderResourceState = (panel, resource) => {
        if (resource?.status === 'loading') {
          appendText(panel, 'p', '불러오는 중');
          return true;
        }
        if (resource?.status === 'error') {
          appendText(panel, 'p', errorText(resource));
          return true;
        }
        if (resource?.status !== 'ok') {
          appendText(panel, 'p', '확인 불가: 응답 상태를 확인할 수 없습니다.');
          return true;
        }
        return false;
      };
      const identityOk = me?.status === 'ok' && me.data?.user && me.data?.device && me.data?.session;

      const accountPanel = section('계정', me);
      if (!renderResourceState(accountPanel, me)) {
        if (!identityOk) appendText(accountPanel, 'p', '확인 불가: 응답 형식을 확인할 수 없습니다.');
        else {
          const user = me.data.user;
          appendText(accountPanel, 'p', `사용자: ${String(user.label || user.id)} (ID: ${String(user.id ?? '')})`);
        }
      }

      const devicePanel = section('기기', devices);
      if (identityOk) {
        const current = me.data.device;
        appendText(devicePanel, 'p', `현재 기기: ${String(current.label || current.id)} (ID: ${String(current.id ?? '')}) · ${statusText('device', current.status)}`);
      }
      if (!renderResourceState(devicePanel, devices)) {
        if (!Array.isArray(devices.data)) {
          appendText(devicePanel, 'p', '확인 불가: 기기 목록 응답 형식을 확인할 수 없습니다.');
        } else if (devices.data.length === 0) {
          appendText(devicePanel, 'p', '표시할 기기가 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const device of devices.data) {
            const item = document.createElement('li');
            item.textContent = `${String(device.label || device.id)} (ID: ${String(device.id ?? '')}) · ${statusText('device', device.status)}`;
            list.append(item);
          }
          devicePanel.append(list);
        }
      }

      const sessionPanel = section('로그인 세션', sessions);
      if (identityOk) {
        const current = me.data.session;
        appendText(sessionPanel, 'p', `현재 세션: ${String(current.id ?? '')} · ${statusText('session', current.status)}`);
      }
      if (!renderResourceState(sessionPanel, sessions)) {
        if (!Array.isArray(sessions.data)) {
          appendText(sessionPanel, 'p', '확인 불가: 세션 목록 응답 형식을 확인할 수 없습니다.');
        } else if (sessions.data.length === 0) {
          appendText(sessionPanel, 'p', '표시할 세션이 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const session of sessions.data) {
            const item = document.createElement('li');
            item.textContent = `${String(session.id ?? '')} · ${statusText('session', session.status)}`;
            list.append(item);
          }
          sessionPanel.append(list);
        }
      }

      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const root = document.createElement('div');
      const appendText = (tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        root.append(node);
        return node;
      };
      const safeText = (value, fallback) => typeof value === 'string' && value.length > 0 ? value : fallback;
      const selectedAppId = safeText(appId, safeText(data?.appId, '확인 불가'));

      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      if (Object.hasOwn(modeLabels, mode)) {
        appendText('p', `연결 모드: ${modeLabels[mode]}`);
        if (mode === 'demo') appendText('p', '실제 업무 앱 접근 판정이 아닙니다.');
      }

      if (status === 'idle') {
        appendText('p', '업무 앱을 선택하고 접근 요청을 하세요.');
        if (selectedAppId !== '확인 불가') appendText('p', `선택한 앱 ID: ${selectedAppId}`);
        return root;
      }
      if (status === 'loading') {
        appendText('p', '판정 확인 중');
        if (selectedAppId !== '확인 불가') appendText('p', `선택한 앱 ID: ${selectedAppId}`);
        return root;
      }
      if (status === 'error') {
        const message = safeText(error?.message, '서버가 오류 메시지를 제공하지 않았습니다.');
        appendText('p', `요청 실패: ${message}`);
        appendText('p', '요청 실패는 접근 거부 판정이 아니며, 접근 허용을 뜻하지도 않습니다.');
        if (selectedAppId !== '확인 불가') appendText('p', `요청한 앱 ID: ${selectedAppId}`);
        return root;
      }

      if (status !== 'ok') {
        appendText('p', '확인 불가(unknown) · 판정 상태를 확인할 수 없습니다. 접근 허용으로 간주하지 마세요.');
        return root;
      }

      const returnedAppId = safeText(data?.appId, selectedAppId);
      appendText('p', `판정 대상 앱 ID: ${returnedAppId}`);

      const labels = {
        allow: '접근 허용(allow)',
        deny: '접근 거부(deny)',
        challenge: '추가 인증 또는 확인 필요(challenge)',
        unknown: '확인 불가(unknown)',
      };
      const decision = typeof data?.decision === 'string' ? data.decision : 'unknown';
      const knownDecision = Object.hasOwn(labels, decision);
      appendText('p', knownDecision ? labels[decision] : '확인 불가(unknown) · 알 수 없는 판정값');
      if (!knownDecision && decision !== 'unknown') {
        appendText('p', `원래 판정값: ${decision}`);
      }
      if (decision === 'unknown' || !knownDecision) {
        appendText('p', '접근 허용으로 간주하지 마세요.');
      }
      if (decision === 'allow') {
        appendText('p', '이는 정책상 접근 허용 판정이며 실제 앱 접속 성공을 보장하지 않습니다.');
      }
      if (decision === 'challenge') {
        appendText('p', '추가 확인이 필요합니다. 이 화면은 앱의 확인 절차를 대신 수행하지 않습니다.');
      }

      appendText('p', `판정 이유: ${safeText(data?.reason, '이유를 확인할 수 없습니다.')}`);
      appendText('p', `판정 시각: ${safeText(data?.checkedAt, '시각을 확인할 수 없습니다.')}`);
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('div');
      const appendText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      if (Object.hasOwn(modeLabels, mode)) appendText(root, 'p', `연결 모드: ${modeLabels[mode]}`);

      if (status === 'loading') {
        appendText(root, 'p', '기록을 불러오는 중');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.length > 0
          ? error.message
          : '서버가 오류 메시지를 제공하지 않았습니다.';
        if (error?.code === 'CONTRACT_MISMATCH') appendText(root, 'p', `확인 불가: ${message}`);
        else appendText(root, 'p', `기록을 불러오지 못했습니다: ${message}`);
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        appendText(root, 'p', '확인 불가: 기록 응답을 확인할 수 없습니다.');
        return root;
      }

      // 정렬은 전달된 배열을 복사한 뒤 수행한다. 서버/호출자 소유 배열은 변경하지 않는다.
      const events = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      const countNode = appendText(root, 'p', `표시 0건 / 받은 기록 ${events.length}건`);
      if (events.length === 0) {
        appendText(root, 'p', '표시할 기록이 없습니다');
        return root;
      }
      const kindLabels = { access: '접속 기록', xdr: 'XDR 경보' };
      const accessLabels = { allowed: '접근 허용', denied: '접근 거부', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const displayState = (labels, value) => {
        const code = typeof value === 'string' ? value : 'unknown';
        const label = Object.hasOwn(labels, code) ? labels[code] : '확인 불가';
        return `${label}(${code})`;
      };
      const uniqueValues = (values) => [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))]
        .sort((a, b) => a.localeCompare(b));
      const filters = { kind: 'all', appId: 'all', access: 'all' };
      let selectedEventId = null;

      const filterPanel = document.createElement('div');
      const listPanel = document.createElement('ul');
      const detailPanel = document.createElement('div');
      root.append(filterPanel, listPanel, detailPanel);

      const makeFilter = (labelText, id, values, selected, labelForValue, onChange) => {
        const label = document.createElement('label');
        label.textContent = `${labelText}: `;
        const select = document.createElement('select');
        select.setAttribute('aria-label', labelText);
        select.name = id;
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.append(allOption);
        for (const value of values) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = labelForValue(value);
          select.append(option);
        }
        select.value = selected;
        select.addEventListener('change', () => onChange(select.value));
        label.append(select);
        filterPanel.append(label);
      };

      makeFilter('기록 종류', 'event-kind', uniqueValues(events.map((event) => event.kind)), filters.kind,
        (value) => `${Object.hasOwn(kindLabels, value) ? kindLabels[value] : '확인 불가'}(${value})`,
        (value) => { filters.kind = value; selectedEventId = null; renderFilteredEvents(); });
      makeFilter('업무 앱', 'event-app', uniqueValues(events.map((event) => event.appId)), filters.appId,
        (value) => value,
        (value) => { filters.appId = value; selectedEventId = null; renderFilteredEvents(); });
      makeFilter('접속 상태', 'event-access', uniqueValues(events.map((event) => event.state.access)), filters.access,
        (value) => displayState(accessLabels, value),
        (value) => { filters.access = value; selectedEventId = null; renderFilteredEvents(); });

      const renderDetail = (event) => {
        detailPanel.replaceChildren();
        if (!event) return;
        const detail = document.createElement('section');
        detail.setAttribute('data-student-event-detail', String(event.id));
        appendText(detail, 'h3', `${String(event.id)} 상세`);
        appendText(detail, 'p', `사건 ID: ${String(event.id)}`);
        appendText(detail, 'p', `앱 ID: ${typeof event.appId === 'string' ? event.appId : '앱을 확인할 수 없습니다.'}`);

        appendText(detail, 'h4', '근거');
        if (event.evidence.length === 0) appendText(detail, 'p', '근거가 없습니다.');
        else {
          const evidenceList = document.createElement('ul');
          for (const item of event.evidence) appendText(evidenceList, 'li', `${String(item.id)}: ${String(item.text)}`);
          detail.append(evidenceList);
        }

        appendText(detail, 'h4', '규칙');
        if (event.rules.length === 0) appendText(detail, 'p', '규칙이 없습니다.');
        else {
          const rulesList = document.createElement('ul');
          for (const item of event.rules) appendText(rulesList, 'li', `${String(item.id)}: ${String(item.text)}`);
          detail.append(rulesList);
        }

        appendText(detail, 'h4', '상태');
        appendText(detail, 'p', `접속: ${displayState(accessLabels, event.state.access)}`);
        appendText(detail, 'p', `세션: ${displayState(sessionLabels, event.state.session)}`);
        appendText(detail, 'p', `기기: ${displayState(deviceLabels, event.state.device)}`);
        detailPanel.append(detail);
      };

      function renderFilteredEvents() {
        const visibleEvents = events.filter((event) =>
          (filters.kind === 'all' || event.kind === filters.kind)
          && (filters.appId === 'all' || event.appId === filters.appId)
          && (filters.access === 'all' || event.state.access === filters.access));
        countNode.textContent = `표시 ${visibleEvents.length}건 / 받은 기록 ${events.length}건`;
        listPanel.replaceChildren();
        if (visibleEvents.length === 0) {
          appendText(listPanel, 'li', '필터와 일치하는 기록이 없습니다.');
          renderDetail(null);
          return;
        }
        for (const event of visibleEvents) {
          const row = document.createElement('li');
          row.setAttribute('data-student-event-id', String(event.id));
          appendText(row, 'p', `사건 ID: ${String(event.id)}`);
          appendText(row, 'p', `시각: ${String(event.at)}`);
          const kind = typeof event.kind === 'string' ? event.kind : 'unknown';
          appendText(row, 'p', `종류: ${Object.hasOwn(kindLabels, kind) ? kindLabels[kind] : '확인 불가'}(${kind})`);
          appendText(row, 'p', `앱: ${typeof event.appId === 'string' ? event.appId : '앱을 확인할 수 없습니다.'}`);
          appendText(row, 'p', `요약: ${String(event.summary)}`);
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${String(event.id)} 상세`;
          button.setAttribute('aria-label', `${String(event.id)} 상세`);
          button.addEventListener('click', () => {
            selectedEventId = event.id;
            renderDetail(event);
          });
          row.append(button);
          listPanel.append(row);
        }
        renderDetail(visibleEvents.find((event) => event.id === selectedEventId) || null);
      }

      renderFilteredEvents();
      return root;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
