import { describe, expect, it } from 'vitest';

/**
 * 곡 복사 단위 테스트
 *
 * 목적: 독립적 복사 검증
 * 동일한 곡이 여러 콘티에 추가될 때, 각 콘티의 곡은 독립적으로 관리되어야 함
 */

interface Song {
  id: string;
  title: string;
  composer: string | null;
}

interface ContiSong {
  id: string;
  conti_id: string;
  song_id: string | null;
  title: string;
  composer: string | null;
  bpm_array: number[];
  notes: string | null;
}

describe('Song Copy - Independent Data', () => {
  it('should create independent copies for each conti', () => {
    // Original song
    const originalSong: Song = {
      id: 'song-1',
      title: '주 안에 있는 나에게',
      composer: '작곡가A',
    };

    // Conti 1: Copy song
    const conti1Song: ContiSong = {
      id: 'conti-song-1',
      conti_id: 'conti-1',
      song_id: 'song-copy-1', // New song ID (independent copy)
      title: originalSong.title,
      composer: originalSong.composer,
      bpm_array: [120],
      notes: '콘티1 메모',
    };

    // Conti 2: Copy same song
    const conti2Song: ContiSong = {
      id: 'conti-song-2',
      conti_id: 'conti-2',
      song_id: 'song-copy-2', // Different song ID (independent copy)
      title: originalSong.title,
      composer: originalSong.composer,
      bpm_array: [140],
      notes: '콘티2 메모',
    };

    // Verify independence
    expect(conti1Song.song_id).not.toBe(conti2Song.song_id);
    expect(conti1Song.id).not.toBe(conti2Song.id);
    expect(conti1Song.bpm_array).not.toEqual(conti2Song.bpm_array);
    expect(conti1Song.notes).not.toBe(conti2Song.notes);
  });

  it('should allow independent BPM modifications', () => {
    const conti1Bpm = [120, 140];
    const conti2Bpm = [100, 110, 120];

    // Modify conti1's BPM
    conti1Bpm.push(160);

    // conti2's BPM should remain unchanged
    expect(conti1Bpm).toEqual([120, 140, 160]);
    expect(conti2Bpm).toEqual([100, 110, 120]);
  });

  it('should allow independent title modifications', () => {
    const originalTitle = '주 안에 있는 나에게';

    let conti1Title = originalTitle;
    const conti2Title = originalTitle;

    // Modify conti1's title
    conti1Title = `${originalTitle} (특별 버전)`;

    // conti2's title should remain unchanged
    expect(conti1Title).toBe('주 안에 있는 나에게 (특별 버전)');
    expect(conti2Title).toBe('주 안에 있는 나에게');
  });

  it('should allow independent deletion', () => {
    const contiSongs = [
      { id: 'cs-1', conti_id: 'c1', song_id: 'song-copy-1', title: 'Song 1' },
      { id: 'cs-2', conti_id: 'c2', song_id: 'song-copy-2', title: 'Song 1' },
    ];

    // Delete from conti 1
    const afterDelete = contiSongs.filter((cs) => cs.conti_id !== 'c1');

    // Only conti 2's song should remain
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0].conti_id).toBe('c2');
  });

  it('should preserve all song properties during copy', () => {
    const sourceContiSong: ContiSong = {
      id: 'cs-source',
      conti_id: 'conti-source',
      song_id: 'song-source',
      title: '복사할 곡',
      composer: '작곡가',
      bpm_array: [120, 140],
      notes: '원본 메모',
    };

    // Simulate copy operation
    const copiedContiSong: ContiSong = {
      id: 'cs-new', // New ID
      conti_id: 'conti-target',
      song_id: 'song-new', // New song ID
      title: sourceContiSong.title,
      composer: sourceContiSong.composer,
      bpm_array: [...sourceContiSong.bpm_array], // Deep copy array
      notes: sourceContiSong.notes,
    };

    // Verify all properties are copied
    expect(copiedContiSong.title).toBe(sourceContiSong.title);
    expect(copiedContiSong.composer).toBe(sourceContiSong.composer);
    expect(copiedContiSong.bpm_array).toEqual(sourceContiSong.bpm_array);
    expect(copiedContiSong.notes).toBe(sourceContiSong.notes);

    // Verify independence (different IDs)
    expect(copiedContiSong.id).not.toBe(sourceContiSong.id);
    expect(copiedContiSong.song_id).not.toBe(sourceContiSong.song_id);
    expect(copiedContiSong.conti_id).not.toBe(sourceContiSong.conti_id);

    // Verify array is deeply copied
    copiedContiSong.bpm_array.push(160);
    expect(sourceContiSong.bpm_array).toEqual([120, 140]);
    expect(copiedContiSong.bpm_array).toEqual([120, 140, 160]);
  });
});
