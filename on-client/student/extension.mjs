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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
